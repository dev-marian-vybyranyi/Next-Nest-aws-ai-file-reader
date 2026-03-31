import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBService } from '../shared/dynamodb.service';

@Injectable()
export class UsersService {
  private readonly table: string;

  constructor(
    private readonly dynamodb: DynamoDBService,
    private readonly config: ConfigService,
  ) {
    this.table = this.config.get('DYNAMODB_USERS_TABLE')!;
  }

  async findUser(email: string) {
    const result = await this.dynamodb.client.send(
      new GetCommand({
        TableName: this.table,
        Key: { email },
      }),
    );
    return result.Item ?? null;
  }

  async getOrCreateUser(email: string) {
    const existing = await this.findUser(email);
    if (existing) return existing;

    const user = {
      email,
      createdAt: new Date().toISOString(),
    };

    await this.dynamodb.client.send(
      new PutCommand({
        TableName: this.table,
        Item: user,
      }),
    );

    return user;
  }
}
