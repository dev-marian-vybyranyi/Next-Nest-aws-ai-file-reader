import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { FilesService } from '../files/files.service';

@Injectable()
export class ChatService {
  private readonly pinecone: Pinecone;
  private readonly openai: OpenAI;
  private readonly indexName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly filesService: FilesService,
  ) {
    this.pinecone = new Pinecone({
      apiKey: this.config.get('PINECONE_API_KEY')!,
    });
    this.openai = new OpenAI({
      apiKey: this.config.get('OPENAI_API_KEY'),
    });
    this.indexName = this.config.get('PINECONE_INDEX')!;
  }

  async askQuestion(email: string, question: string) {
    const file = await this.filesService.getFileByEmail(email);
    if (!file) {
      throw new BadRequestException(
        'No file found. Please upload a PDF first.',
      );
    }
    if (file.status !== 'success') {
      throw new BadRequestException(
        `File is not ready yet. Current status: ${file.status}`,
      );
    }

    const index = this.pinecone.index(this.indexName);

    const searchResults = await index.searchRecords({
      query: {
        topK: 5,
        inputs: { text: question },
        filter: { email: { $eq: email } },
      },
      fields: ['chunk_text', 'email'],
    });

    const chunks = searchResults.result.hits.map(
      (hit) => hit.fields['chunk_text'] as string,
    );

    if (chunks.length === 0) {
      throw new BadRequestException(
        'No relevant content found in your document.',
      );
    }

    const context = chunks.join('\n\n---\n\n');
    const prompt = `You are a helpful assistant. Answer the question based only on the provided context.

Context:
${context}

Question: ${question}

Answer:`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content;

    return { answer, chunksUsed: chunks.length };
  }
}
