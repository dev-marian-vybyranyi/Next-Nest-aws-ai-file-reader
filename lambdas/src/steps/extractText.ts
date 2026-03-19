import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PDFParse } from "pdf-parse";
import { Readable } from "stream";

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

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

  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  const text = parsed.text.trim();

  console.log(`Extracted ${text.length} characters`);

  return { fileId, s3Key, email, text };
}
