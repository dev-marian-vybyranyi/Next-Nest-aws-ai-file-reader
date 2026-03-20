import { Message } from "@/types/message";

interface Props {
  message: Message;
}

export function MessageItem({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
          isUser ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
