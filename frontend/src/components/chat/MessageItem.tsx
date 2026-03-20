import { Message } from "@/types/message";

interface Props {
  message: Message;
}

export function MessageItem({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] px-4 py-2 text-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
            : "bg-slate-900/50 border border-white/10 text-white rounded-2xl rounded-bl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}
