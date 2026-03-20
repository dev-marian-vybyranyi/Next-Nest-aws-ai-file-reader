import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { extractText } from "unpdf";

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await extractText(new Uint8Array(buffer), { mergePages: true });
  return (result.text as string).trim();
}

export async function handler(event: any) {
  console.log("ExtractText input:", JSON.stringify(event));

  const { fileId, s3Key, email } = event;

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    }),
  );

  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);

  const text = await extractTextFromPdf(buffer);
  console.log(`Extracted ${text.length} characters`);

  return { fileId, s3Key, email, text };
}
