import { filesApi, uploadsApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

export function useFile(email: string) {
  const queryClient = useQueryClient();
  const [uploadError, setUploadError] = useState("");

  const { data: file, isLoading } = useQuery({
    queryKey: ["file", email],
    queryFn: () => filesApi.getByEmail(email).then((r) => r.data),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" ? 2000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (f: File) => {
      setUploadError("");
      const { data } = await uploadsApi.getPresignedUrl(email);

      const formData = new FormData();
      Object.entries(data.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", f);
      await axios.post(data.url, formData);

      return filesApi
        .create({ email, s3Key: data.s3Key, filename: f.name })
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file", email] });
    },
    onError: (err: any) => {
      setUploadError(
        err.response?.data?.message ?? "Upload failed. Please try again.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => filesApi.delete(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file", email] });
    },
  });

  return {
    file,
    isLoading,
    uploadError,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    upload: uploadMutation.mutate,
    deleteFile: deleteMutation.mutate,
  };
}
