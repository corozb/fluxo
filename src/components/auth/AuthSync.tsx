"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePOSStore } from "@/stores/posStore";
import { syncUser } from "@/actions/auth.actions";

export default function AuthSync() {
  const { user, session } = useAuth();
  const { login, logout, currentUser } = usePOSStore();

  useEffect(() => {
    const sync = async () => {
      if (user) {
        try {
          // Sync with Prisma and get the latest role from DB
          const result = await syncUser(
            user.id, 
            user.email || "", 
            user.user_metadata?.name || user.email?.split("@")[0] || "User"
          );

          if (result.success) {
            const role = result.role === "ADMIN" ? "admin" : "cashier";
            
            const posUser = {
              id: user.id,
              name: result.name || "User",
              email: user.email || "",
              role: role as "admin" | "cashier",
            };

            // Only update if not already logged in or different user/role
            if (
              !currentUser || 
              currentUser.id !== user.id || 
              currentUser.role !== role
            ) {
              login(posUser);
            }
          }
        } catch (error) {
          console.error("Failed to sync user", error);
        }
      } else if (currentUser && !session) {
        // Only logout if store has user but session is gone
        logout();
      }
    };

    sync();
  }, [user, session, login, logout, currentUser]);

  return null;
}
