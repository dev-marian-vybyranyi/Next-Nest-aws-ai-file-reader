export interface PresignedUrlResponse {
  fileId: string;
  s3Key: string;
  url: string;
  fields: Record<string, string>;
}

export interface CreateFileRequest {
  email: string;
  s3Key: string;
  filename: string;
}

export interface CreateFileResponse {
  fileId: string;
  status: string;
}

export interface FileStatusResponse {
  fileId: string;
  status: string;
  filename: string;
}

export interface ChatAskRequest {
  email: string;
  question: string;
}

export interface ChatAskResponse {
  answer: string;
  chunksUsed: number;
}
