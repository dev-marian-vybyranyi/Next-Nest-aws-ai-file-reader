"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileData {
  fileId: string;
  filename: string;
  status: string;
}

interface Props {
  file: FileData;
  isDeleting: boolean;
  onDelete: () => void;
}

const statusConfig = {
  pending: {
    label: "Processing...",
    className: "bg-white/5 border border-white/10 text-yellow-400",
  },
  success: { label: "Ready", className: "bg-white/5 border border-white/10 text-blue-400" },
  error: { label: "Error", className: "bg-white/5 border border-white/10 text-red-400" },
};

export function FileStatus({ file, isDeleting, onDelete }: Props) {
  const config = statusConfig[file.status as keyof typeof statusConfig];

  return (
    <Card className="border-white/10 bg-slate-900 text-white">
      <CardHeader>
        <CardTitle className="text-sm">Your Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs font-medium truncate">{file.filename}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full inline-block ${config?.className}`}
        >
          {config?.label}
        </span>
        {file.status === "pending" && (
          <p className="text-xs text-slate-400">This may take a minute...</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-white/10 bg-white/5 text-red-400 hover:bg-white/10 hover:text-red-300"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete file"}
        </Button>
      </CardContent>
    </Card>
  );
}
