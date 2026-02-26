"use server";

import prisma from "@/lib/prisma";
import { CloudCog } from 'lucide-react';
import { revalidatePath } from "next/cache";

// --- Categories ---

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string, description?: string) {
  try {
    const category = await prisma.category.create({
      data: { name, description },
    });
    revalidatePath("/pos");
    revalidatePath("/inventory");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/pos");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}

// --- Products ---

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      inventory: true,
    },
    orderBy: { name: "asc" },
  });
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    cost: Number(p.cost) || 0,
  }));
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const cost = parseFloat((formData.get("cost") as string) || "0"); // Default to 0 if not provided
  const barcode = formData.get("barcode") as string;
  const categoryId = formData.get("categoryId") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string) || 0;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price,
        cost,
        categoryId,
        barcode,
        // stock: stock, // Removed: stock belongs to Inventory relation, not Product model
        lowStockThreshold,
        description,
        inventory: {
          create: {
            quantity: stock,
          },
        },
      },
    });
    revalidatePath("/pos");
    revalidatePath("/inventory");
    return { success: true, data: { ...product, price: Number(product.price), cost: Number(product.cost) || 0 } };

  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const cost = parseFloat((formData.get("cost") as string) || "0");
  const barcode = formData.get("barcode") as string;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string) || 0;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        cost,
        categoryId,
        barcode,
        lowStockThreshold,
        description,
        inventory: {
          upsert: {
            create: { quantity: stock },
            update: { quantity: stock },
          },
        },
      },
    });
    revalidatePath("/pos");
    revalidatePath("/inventory");
    return { success: true, data: { ...product, price: Number(product.price), cost: Number(product.cost) || 0 } };

  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function updateStock(productId: string, quantity: number) {
  try {
    await prisma.inventory.upsert({
      where: { productId },
      update: { quantity },
      create: { productId, quantity },
    });
    revalidatePath("/pos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update stock" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Delete inventory first due to relation (or rely on cascade delete if configured, currently strict)
    await prisma.inventory.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    revalidatePath("/pos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}
