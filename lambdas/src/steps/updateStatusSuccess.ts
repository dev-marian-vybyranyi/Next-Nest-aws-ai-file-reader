import { updateFileStatus } from "../shared";

export async function handler(event: any) {
  console.log("UpdateStatusSuccess input:", JSON.stringify(event));
  const { fileId } = event;
  await updateFileStatus(fileId, "success");
  console.log(`File ${fileId} status set to success`);
  return { fileId, status: "success" };
}
