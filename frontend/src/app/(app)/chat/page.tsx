"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userEmail");
    if (!stored) {
      router.replace("/login");
    } else {
      setEmail(stored);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    router.replace("/login");
  };

  if (!email) return null;

  return <ChatWindow email={email} onLogout={handleLogout} />;
}
