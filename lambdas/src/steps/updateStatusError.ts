import { updateFileStatus } from "../shared";

export async function handler(event: any) {
  console.log("UpdateStatusError input:", JSON.stringify(event));

  const fileId = event.fileId ?? event?.input?.fileId;

  if (fileId) {
    await updateFileStatus(fileId, "error");
    console.log(`File ${fileId} status set to error`);
  }

  return { fileId, status: "error" };
}
