"use client";

import { Message } from "@/types/message";
import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

interface Props {
  messages: Message[];
  isThinking: boolean;
  fileStatus?: string;
}

export function MessageList({ messages, isThinking, fileStatus }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const emptyText = !fileStatus
    ? "Upload a PDF document to start chatting"
    : fileStatus === "pending"
      ? "Waiting for document to be processed..."
      : fileStatus === "error"
        ? "Document processing failed. Try uploading again."
        : "Ask a question about your document";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center px-8">
          <p className="text-slate-400 text-sm text-center max-w-xs">
            {emptyText}
          </p>
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageItem key={i} message={msg} />
      ))}
      {isThinking && (
        <div className="flex justify-start mb-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-blue-400 flex items-center gap-2">
            <span className="ml-1 italic text-slate-400">Thinking...</span>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
