"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef } from "react";
import { toast } from "react-hot-toast";

interface Props {
  onUpload: (file: File) => void;
  isUploading: boolean;
  error: string;
}

export function FileUpload({ onUpload, isUploading, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }

    onUpload(file);
  };

  return (
    <Card className="border-white bg-slate-900 text-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white">
          Your Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          Upload a PDF to start chatting. Max size: 10MB.
        </p>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Uploading...
            </span>
          ) : (
            "Upload PDF"
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      </CardContent>
    </Card>
  );
}
