"use client";

import { usePOSStore } from "@/stores/posStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser } = usePOSStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Small timeout to allow state hydration if needed, 
    // but typically usePOSStore with persist middleware hydrates synchronously from localStorage if available
    if (!currentUser) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [currentUser, router]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      {children}
      <MobileBottomNav />
    </div>
  );
}
