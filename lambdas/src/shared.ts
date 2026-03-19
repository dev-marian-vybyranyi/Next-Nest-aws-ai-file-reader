import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const raw = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
export const dynamo = DynamoDBDocumentClient.from(raw);

export async function getFileRecord(fileId: string) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: process.env.DYNAMODB_FILES_TABLE,
      Key: { fileId },
    }),
  );
  return result.Item;
}

export async function updateFileStatus(
  fileId: string,
  status: "success" | "error",
) {
  const file = await getFileRecord(fileId);
  if (!file) return;

  await dynamo.send(
    new PutCommand({
      TableName: process.env.DYNAMODB_FILES_TABLE,
      Item: {
        ...file,
        status,
        updatedAt: new Date().toISOString(),
      },
    }),
  );
}
