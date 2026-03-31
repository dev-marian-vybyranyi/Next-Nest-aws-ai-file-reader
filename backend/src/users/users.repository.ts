import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBService } from '../shared/dynamodb.service';

@Injectable()
export class UsersRepository {
  private readonly table: string;

  constructor(
    private readonly dynamodb: DynamoDBService,
    private readonly config: ConfigService,
  ) {
    this.table = this.config.get('DYNAMODB_USERS_TABLE')!;
  }

  async findByEmail(email: string) {
    const result = await this.dynamodb.client.send(
      new GetCommand({
        TableName: this.table,
        Key: { email },
      }),
    );
    return result.Item ?? null;
  }

  async createUser(user: { email: string; createdAt: string }) {
    await this.dynamodb.client.send(
      new PutCommand({
        TableName: this.table,
        Item: user,
      }),
    );
    return user;
  }
}
