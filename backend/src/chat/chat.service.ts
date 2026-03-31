import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get('OPENAI_API_KEY'),
    });
  }

  async generateAnswer(context: string, question: string) {
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

    const answer = completion.choices[0].message?.content || 'No answer generated.';

    return { answer };
  }
}
