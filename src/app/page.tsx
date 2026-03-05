"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePOSStore } from "@/stores/posStore";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { currentUser } = usePOSStore();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user || currentUser) {
        router.push("/pos");
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, user, currentUser, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
