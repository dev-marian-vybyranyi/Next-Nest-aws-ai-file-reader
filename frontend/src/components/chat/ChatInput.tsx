"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
  isLoading: boolean;
}

export function ChatInput({ onSend, disabled, isLoading }: Props) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled || isLoading) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="border-t border-white/10 p-4 flex gap-3 bg-slate-900/40">
      <Input
        placeholder={disabled ? "Upload a document first" : "Ask a question..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled || isLoading}
        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !value.trim() || isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[80px]"
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        ) : (
          "Send"
        )}
      </Button>
    </div>
  );
}
