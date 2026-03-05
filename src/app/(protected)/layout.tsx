"use client";

import { usePOSStore } from "@/stores/posStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser } = usePOSStore();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && !currentUser) {
      router.push("/login");
    }
  }, [isLoading, user, currentUser, router]);

  if (isLoading || (!user && !currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background pb-16 lg:pb-0">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      {children}
      <MobileBottomNav />
    </div>
  );
}
