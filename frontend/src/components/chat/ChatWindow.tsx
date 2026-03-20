"use client";

import { FileStatus } from "@/components/files/FileStatus";
import { FileUpload } from "@/components/files/FileUpload";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { useFile } from "@/hooks/useFile";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface Props {
  email: string;
  onLogout: () => void;
}

export function ChatWindow({ email, onLogout }: Props) {
  const { file, uploadError, isUploading, isDeleting, upload, deleteFile } =
    useFile(email);
  const { messages, isThinking, sendMessage } = useChat(email);

  const isReady = file?.status === "success";
  return (
    <div className="h-screen bg-blue-950 flex flex-col text-white overflow-hidden">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">PDF Chat</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200/60">{email}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-white/10 bg-white/5"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="flex flex-1 container mx-auto px-4 py-8 gap-8 overflow-hidden">
        <aside className="w-80 shrink-0">
          {!file ? (
            <FileUpload
              onUpload={upload}
              isUploading={isUploading}
              error={uploadError}
            />
          ) : (
            <FileStatus
              file={file}
              isDeleting={isDeleting}
              onDelete={() => deleteFile()}
            />
          )}
        </aside>

        <div className="flex-1 flex flex-col border border-white/10 rounded-xl bg-slate-900/20 overflow-hidden">
          <MessageList
            messages={messages}
            isThinking={isThinking}
            fileStatus={file?.status}
          />
          <ChatInput
            onSend={sendMessage}
            disabled={!isReady}
            isLoading={isThinking}
          />
        </div>
      </main>
    </div>
  );
}
