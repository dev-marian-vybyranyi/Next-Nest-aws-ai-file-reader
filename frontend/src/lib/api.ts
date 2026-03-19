import axios from "axios";
import {
  PresignedUrlResponse,
  CreateFileRequest,
  CreateFileResponse,
  FileStatusResponse,
  ChatAskRequest,
  ChatAskResponse,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const usersApi = {
  upsert: (email: string) => api.post("/users", { email }),
};

export const uploadsApi = {
  getPresignedUrl: (email: string) =>
    api.get<PresignedUrlResponse>(`/uploads/presigned-url?email=${email}`),
};

export const filesApi = {
  create: (data: CreateFileRequest) =>
    api.post<CreateFileResponse>("/files", data),

  getStatus: (fileId: string) =>
    api.get<FileStatusResponse>(`/files/status/${fileId}`),

  getByEmail: (email: string) =>
    api.get<FileStatusResponse | null>(`/files/by-email/${email}`),

  delete: (email: string) => api.delete(`/files/${email}`),
};

export const chatApi = {
  ask: (data: ChatAskRequest) => api.post<ChatAskResponse>("/chat/ask", data),
};
