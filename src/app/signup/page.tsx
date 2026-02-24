"use client";

import { Signup } from "@/views/Signup";
import { useRouter } from "next/navigation";
import { usePOSStore } from "@/stores/posStore";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { currentUser } = usePOSStore();

  useEffect(() => {
    if (currentUser) {
      router.push("/pos");
    }
  }, [currentUser, router]);

  return <Signup />;
}
