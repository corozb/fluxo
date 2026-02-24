import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  category: string;
  image?: string;
  stock: number;
  lowStockThreshold: number;
  barcode?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
  originalPrice: number; // Store original product price
  unitPrices: number[]; // Store individual prices for each unit
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  discount: number;
  paymentMethod: 'cash' | 'card' | 'digital' | 'transfer';
  timestamp: Date;
  cashierId: string;
  customerId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}

interface POSState {
  // Cart
  cart: CartItem[];

  cartTotal: number;
  cartTax: number;
  cartDiscount: number;
  cartSubtotal: number;
  
  // Sales
  sales: Sale[];
  todaySales: Sale[];
  saleDate: Date;
  
  // User
  currentUser: User | null;
  
  // UI State
  searchQuery: string;
  selectedCategory: string;
  isCheckoutOpen: boolean;
  
  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemPrice: (productId: string, newPrice: number) => void;
  updateCartUnitPrice: (productId: string, unitIndex: number, newPrice: number) => void;
  clearCart: () => void;
  
  // Search and filter (moved to local component state or keeping for UI global filter?)
  // Keeping for UI coordination between header and views
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  // filterProducts removed as it should be done in the component/hook level
  
  // Sales
  setSaleDate: (date: Date) => void;
  completeSale: (paymentMethod: 'cash' | 'card' | 'digital' | 'transfer', customerId?: string) => string;
  
  // User
  login: (user: User) => void;
  logout: () => void;
  
  // UI
  toggleCheckout: () => void;
}

// Mock data removed in favor of Database


// Categories store
interface CategoriesState {
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

const defaultCategories = ['Coffee', 'Tea', 'Pastry', 'Sandwich', 'Salad', 'Beverage', 'Snack'];



export const usePOSStore = create<POSState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        cart: [],
        cartTotal: 0,
        cartTax: 0,
        cartDiscount: 0,
        cartSubtotal: 0,
        sales: [],
        todaySales: [],
        saleDate: new Date(),
        currentUser: null,
        searchQuery: '',
        selectedCategory: 'All',
        isCheckoutOpen: false,

        // Cart actions
        addToCart: (product, quantity = 1) => {
          const { cart } = get();
          const existingItem = cart.find(item => item.id === product.id);
          
          if (existingItem) {
            // Add new units with original price
            const newUnitPrices = [...existingItem.unitPrices];
            for (let i = 0; i < quantity; i++) {
              newUnitPrices.push(product.price);
            }
            const newQuantity = existingItem.quantity + quantity;
            const newSubtotal = newUnitPrices.reduce((sum, price) => sum + price, 0);
            
            const newCart = cart.map(item => {
              if (item.id === product.id) {
                return {
                  ...item,
                  quantity: newQuantity,
                  subtotal: newSubtotal,
                  unitPrices: newUnitPrices,
                  price: newSubtotal / newQuantity // Average price for display
                };
              }
              return item;
            });
            
            const subtotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
            const tax = 0;
            const total = subtotal + tax;
            
            set({
              cart: newCart,
              cartSubtotal: subtotal,
              cartTax: tax,
              cartTotal: total
            });
          } else {
            const unitPrices = Array(quantity).fill(product.price);
            const newItem: CartItem = {
              ...product,
              quantity,
              subtotal: product.price * quantity,
              originalPrice: product.price,
              unitPrices
            };
            
            const newCart = [...cart, newItem];
            const subtotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
            const tax = 0; // 0% tax
            const total = subtotal + tax;
            
            set({
              cart: newCart,
              cartSubtotal: subtotal,
              cartTax: tax,
              cartTotal: total
            });
          }
        },

        removeFromCart: (productId) => {
          const { cart } = get();
          const newCart = cart.filter(item => item.id !== productId);
          const subtotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
          const tax = 0;
          const total = subtotal + tax;
          
          set({
            cart: newCart,
            cartSubtotal: subtotal,
            cartTax: tax,
            cartTotal: total
          });
        },

        updateCartQuantity: (productId, quantity) => {
          const { cart } = get();
          const newCart = cart.map(item => {
            if (item.id === productId) {
              const currentQuantity = item.quantity;
              let newUnitPrices = [...item.unitPrices];
              
              if (quantity > currentQuantity) {
                // Adding units - use original price for new units
                for (let i = 0; i < quantity - currentQuantity; i++) {
                  newUnitPrices.push(item.originalPrice);
                }
              } else if (quantity < currentQuantity) {
                // Removing units - remove from the end
                newUnitPrices = newUnitPrices.slice(0, quantity);
              }
              
              const newSubtotal = newUnitPrices.reduce((sum, price) => sum + price, 0);
              
              return {
                ...item,
                quantity,
                subtotal: newSubtotal,
                unitPrices: newUnitPrices,
                price: newSubtotal / quantity // Average price for display
              };
            }
            return item;
          });
          
          const subtotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
          const tax = 0;
          const total = subtotal + tax;
          
          set({
            cart: newCart,
            cartSubtotal: subtotal,
            cartTax: tax,
            cartTotal: total
          });
        },

        updateCartItemPrice: (productId, newPrice) => {
          const { cart } = get();
          const newCart = cart.map(item => {
            if (item.id === productId) {
              const newUnitPrices = Array(item.quantity).fill(newPrice);
              return {
                ...item,
                price: newPrice,
                subtotal: newPrice * item.quantity,
                unitPrices: newUnitPrices
              };
            }
            return item;
          });
          
          const subtotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
          const tax = 0;
          const total = subtotal + tax;
          
          set({
            cart: newCart,
            cartSubtotal: subtotal,
            cartTax: tax,
            cartTotal: total
          });
        },

        updateCartUnitPrice: (productId, unitIndex, newPrice) => {
          const { cart } = get();
          const newCart = cart.map(item => {
            if (item.id === productId && unitIndex >= 0 && unitIndex < item.unitPrices.length) {
              const newUnitPrices = [...item.unitPrices];
              newUnitPrices[unitIndex] = newPrice;
              const newSubtotal = newUnitPrices.reduce((sum, price) => sum + price, 0);
              return {
                ...item,
                subtotal: newSubtotal,
                unitPrices: newUnitPrices,
                price: newSubtotal / item.quantity // Average price for display
              };
            }
            return item;
          });
          
          const subtotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
          const tax = 0;
          const total = subtotal + tax;
          
          set({
            cart: newCart,
            cartSubtotal: subtotal,
            cartTax: tax,
            cartTotal: total
          });
        },

        clearCart: () => {
          set({
            cart: [],
            cartTotal: 0,
            cartTax: 0,
            cartDiscount: 0,
            cartSubtotal: 0
          });
        },

        // Product actions removed - handled by React Query mutations in components


        // Search and filter
        setSearchQuery: (query) => {
          set({ searchQuery: query });
        },

        setSelectedCategory: (category) => {
          set({ selectedCategory: category });
        },

        // Sales
        setSaleDate: (date) => {
          set({ saleDate: date });
        },

        completeSale: (paymentMethod, customerId) => {
          const { cart, cartTotal, cartTax, cartDiscount, currentUser, saleDate } = get();
          
          if (cart.length === 0) return '';
          
          const saleId = `sale-${Date.now()}`;
          const sale: Sale = {
            id: saleId,
            items: [...cart],
            total: cartTotal,
            tax: cartTax,
            discount: cartDiscount,
            paymentMethod,
            timestamp: saleDate,
            cashierId: currentUser?.id || '',
            customerId
          };

          // Stock update is handled by the server action when recording the sale
          // cart.forEach(item => {
          //   get().updateStock(item.id, item.stock - item.quantity);
          // });

          set(state => ({
            sales: [...state.sales, sale],
            todaySales: [...state.todaySales, sale]
          }));

          get().clearCart();
          return saleId;
        },

        // User
        login: (user) => {
          set({ currentUser: user });
        },

        logout: () => {
          set({ currentUser: null });
          get().clearCart();
        },

        // UI
        toggleCheckout: () => {
          set(state => ({ isCheckoutOpen: !state.isCheckoutOpen }));
        }
      }),
      {
        name: 'pos-storage',
        partialize: (state) => ({
          sales: state.sales,
          currentUser: state.currentUser
        })
      }
    )
  )
);