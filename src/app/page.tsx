"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePOSStore } from "@/stores/posStore";

export default function Home() {
  const router = useRouter();
  const { currentUser } = usePOSStore();

  useEffect(() => {
    if (currentUser) {
      router.push("/pos");
    } else {
      router.push("/login");
    }
  }, [currentUser, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
