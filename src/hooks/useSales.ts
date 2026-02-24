import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/actions/sales.actions";
import { Sale } from "@/stores/posStore"; // Using Sale interface from store for consistency, or define here

export function useSales() {
  const salesQuery = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const salesData = await getSales();
      
      // Transform Prisma data to match UI Sale interface
      // Prisma Sale has: id, total, userId, createdAt, paymentMethod, items
      // UI Sale has: id, items, total, tax, discount, paymentMethod, timestamp, cashierId, customerId
      
      return salesData.map((s: any) => ({
        id: s.id,
        items: s.items.map((i: any) => ({
          id: i.product.id,
          name: i.product.name,
          price: Number(i.price),
          quantity: i.quantity,
          subtotal: Number(i.price) * i.quantity,
          unitPrices: [Number(i.price)] // Placeholder
        })),
        total: Number(s.total),
        tax: 0, // Not stored in DB yet, maybe calculate?
        discount: 0,
        paymentMethod: s.paymentMethod as any, // Cast string to enum union
        timestamp: new Date(s.createdAt),
        cashierId: s.userId,
        customerId: undefined // Not stored yet
      })) as Sale[];
    },
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    isError: salesQuery.isError,
    refetch: salesQuery.refetch
  };
}
