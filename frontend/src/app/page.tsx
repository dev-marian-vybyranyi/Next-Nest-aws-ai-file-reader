"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
