import { Pinecone } from "@pinecone-database/pinecone";

export async function handler(event: any) {
  console.log("EmbedAndIndex input chunks count:", event.chunks?.length);

  const { fileId, email, chunks } = event;

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pinecone.index(process.env.PINECONE_INDEX!);

  const records = chunks.map((chunk: string, i: number) => ({
    _id: `${fileId}-chunk-${i}`,
    text: chunk,
    chunk_text: chunk,
    email,
    fileId,
    chunkIndex: i,
  }));

  const BATCH_SIZE = 50;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await index.upsertRecords({ records: batch });
    console.log(`Indexed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
  }

  console.log(`Successfully indexed ${records.length} chunks`);

  return { fileId, email, totalChunks: records.length };
}
