export async function handler(event: any) {
  console.log("ChunkText input:", JSON.stringify(event).slice(0, 200));

  const { fileId, s3Key, email, text } = event;

  const CHUNK_SIZE = 500;
  const OVERLAP = 50;
  const chunks: string[] = [];

  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + CHUNK_SIZE).trim();
    if (chunk.length > 0) chunks.push(chunk);
    i += CHUNK_SIZE - OVERLAP;
  }

  console.log(`Created ${chunks.length} chunks`);

  return { fileId, s3Key, email, chunks };
}
