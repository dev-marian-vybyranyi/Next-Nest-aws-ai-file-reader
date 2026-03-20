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
    className: "bg-yellow-100 text-yellow-700",
  },
  success: { label: "Ready", className: "bg-green-100 text-green-700" },
  error: { label: "Error", className: "bg-red-100 text-red-700" },
};

export function FileStatus({ file, isDeleting, onDelete }: Props) {
  const config = statusConfig[file.status as keyof typeof statusConfig];

  return (
    <Card>
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
          className="w-full text-red-500 hover:text-red-600"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete file"}
        </Button>
      </CardContent>
    </Card>
  );
}
