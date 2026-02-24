"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSale(data: {
  userId: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  method: string;
  date?: Date;
}) {
  const { userId, items, total, method, date } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          userId,
          total,
          paymentMethod: method,
          ...(date ? { createdAt: new Date(date) } : {}),
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // 2. Decrement Inventory for each item
      for (const item of items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    revalidatePath("/pos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: "Failed to process sale" };
  }
}

export async function getSales() {
  return await prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
