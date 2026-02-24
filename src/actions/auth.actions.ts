"use server";

import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = (formData.get("role") as "ADMIN" | "VENDOR") || "VENDOR"; 

  const supabase = await createClient();

  // 1. Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // 2. Create Prisma User
    try {
      await prisma.user.create({
        data: {
          email,
          name,
          role,
          authId: data.user.id,
        },
      });
    } catch (dbError) {
      console.error("Prisma User Create Error:", dbError);
      // Optional: Cleanup Supabase user if Prisma fails, or handle manual sync later
      return { error: "Account created but failed to sync profile. Please contact support." };
    }
  }

  return { success: true };
}

export async function syncUser(authId: string, email: string, name: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { authId },
    });

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          authId,
          email,
          name,
          role: "VENDOR",
        },
      });
      return { success: true, role: newUser.role, name: newUser.name };
    }

    return { success: true, role: user.role, name: user.name };
  } catch (error) {
    console.error("Error syncing user:", error);
    return { success: false, error: "Failed to sync user" };
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUsers() {
  // Verify current user is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.user_metadata?.role || user.user_metadata.role !== "ADMIN") {
    // Ideally check Prisma user role too for security
    const prismaUser = await prisma.user.findUnique({ where: { authId: user?.id } });
    if (prismaUser?.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }
  }

  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(userId: string, newRole: "ADMIN" | "VENDOR") {
  const supabase = await createClient();
  
  // 1. Verify caller is ADMIN
  const { data: { user: caller } } = await supabase.auth.getUser();
  const callerPrisma = await prisma.user.findUnique({ where: { authId: caller?.id } });
  
  if (callerPrisma?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Only admins can change roles" };
  }

  try {
    // 2. Update Prisma Role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // 3. Update Supabase Metadata (so client sees it immediately on next refresh)
    // We need service_role key to update OTHER users. WITHOUT IT, we can't update other users' metadata easily from here.
    // If we only have Anon key, we can't do this part.
    // However, our AuthSync uses Supabase User Metadata OR we can fetch from Prisma.
    // AuthSync currently uses `user.user_metadata?.role`.
    // To make this work robustly without service_role key, AuthSync should fetch the role from a Server Action `getCurrentUserRole()`.
    
    // For now, we update Prisma. The AuthSync will need to be improved to fetch from Prisma if we want real-time update without re-login.
    // Or we assume the user will re-login.
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update role" };
  }
}
