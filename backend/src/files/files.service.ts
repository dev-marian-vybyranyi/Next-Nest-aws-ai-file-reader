import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { Pinecone } from '@pinecone-database/pinecone';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from '../chat/chat.service';
import { DynamoDBService } from '../shared/dynamodb.service';

@Injectable()
export class FilesService {
  private readonly table: string;
  private readonly bucket: string;
  private readonly s3: S3Client;
  private readonly pinecone: Pinecone;
  private readonly indexName: string;

  constructor(
    private readonly dynamodb: DynamoDBService,
    private readonly config: ConfigService,
    private readonly chatService: ChatService,
  ) {
    this.table = this.config.get('DYNAMODB_FILES_TABLE')!;
    this.bucket = this.config.get('AWS_S3_BUCKET')!;
    this.s3 = new S3Client({
      region: this.config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.pinecone = new Pinecone({
      apiKey: this.config.get('PINECONE_API_KEY')!,
    });
    this.indexName = this.config.get('PINECONE_INDEX')!;
  }

  async getFileByEmail(email: string) {
    const result = await this.dynamodb.client.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
      }),
    );
    return result.Items?.[0] ?? null;
  }

  async getFileStatus(fileId: string) {
    const result = await this.dynamodb.client.send(
      new GetCommand({
        TableName: this.table,
        Key: { fileId },
      }),
    );
    return result.Item ?? null;
  }

  async createFile(email: string, filename: string, tmpS3Key: string) {
    const existing = await this.getFileByEmail(email);
    if (existing) {
      throw new BadRequestException(
        'You already have a file uploaded. Delete it first.',
      );
    }

    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: tmpS3Key,
        }),
      );
    } catch {
      throw new BadRequestException(
        'File was not uploaded to S3. Please upload the file first.',
      );
    }

    const fileId = uuidv4();
    const permanentS3Key = `uploads/${email}/${fileId}.pdf`;

    await this.s3.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${tmpS3Key}`,
        Key: permanentS3Key,
      }),
    );

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: tmpS3Key,
      }),
    );

    const file = {
      fileId,
      email,
      s3Key: permanentS3Key,
      filename,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await this.dynamodb.client.send(
      new PutCommand({
        TableName: this.table,
        Item: file,
      }),
    );

    return file;
  }

  async deleteFile(email: string) {
    const file = await this.getFileByEmail(email);
    if (!file) throw new BadRequestException('No file found for this user.');

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: file.s3Key,
      }),
    );

    await this.dynamodb.client.send(
      new DeleteCommand({
        TableName: this.table,
        Key: { fileId: file.fileId },
      }),
    );

    return { success: true };
  }

  async updateFileStatus(fileId: string, status: 'success' | 'error') {
    const file = await this.getFileStatus(fileId);
    if (!file) return;

    await this.dynamodb.client.send(
      new PutCommand({
        TableName: this.table,
        Item: { ...file, status, updatedAt: new Date().toISOString() },
      }),
    );
  }

  async askQuestionAboutFile(email: string, question: string) {
    const file = await this.getFileByEmail(email);
    if (!file) {
      throw new BadRequestException('No file found. Please upload a PDF first.');
    }
    if (file.status !== 'success') {
      throw new BadRequestException(`File is not ready yet. Current status: ${file.status}`);
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

    const chunks = searchResults.result.hits?.map(
      (hit) => hit.fields['chunk_text'] as string,
    ) || [];

    if (chunks.length === 0) {
      throw new BadRequestException('No relevant content found in your document.');
    }

    const context = chunks.join('\n\n---\n\n');
    const { answer } = await this.chatService.generateAnswer(context, question);

    return { answer, chunksUsed: chunks.length };
  }
}

