import { chatApi } from "@/lib/api";
import { Message } from "@/types/message";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function useChat(email: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  const askMutation = useMutation({
    mutationFn: (question: string) =>
      chatApi.ask({ email, question }).then((r) => r.data),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    },
  });

  const sendMessage = (question: string) => {
    if (!question.trim() || askMutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    askMutation.mutate(question);
  };

  const clearMessages = () => setMessages([]);

  return {
    messages,
    isThinking: askMutation.isPending,
    sendMessage,
    clearMessages,
  };
}
