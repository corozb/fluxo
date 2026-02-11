"use client";

import { Login } from "@/views/Login";
import { useRouter } from "next/navigation";
import { usePOSStore } from "@/stores/posStore";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser } = usePOSStore();

  useEffect(() => {
    if (currentUser) {
      router.push("/pos");
    }
  }, [currentUser, router]);

  const handleLogin = () => {
    router.push("/pos");
  };

  return <Login onLogin={handleLogin} />;
}
