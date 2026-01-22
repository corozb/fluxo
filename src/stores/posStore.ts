import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
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
  paymentMethod: 'cash' | 'card' | 'digital';
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
  // Products
  products: Product[];
  filteredProducts: Product[];
  
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
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  filterProducts: () => void;
  
  // Sales
  setSaleDate: (date: Date) => void;
  completeSale: (paymentMethod: 'cash' | 'card' | 'digital', customerId?: string) => string;
  
  // User
  login: (user: User) => void;
  logout: () => void;
  
  // UI
  toggleCheckout: () => void;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Espresso',
    price: 2.99,
    category: 'Coffee',
    stock: 50,
    lowStockThreshold: 10,
    description: 'Rich, bold espresso shot'
  },
  {
    id: '2',
    name: 'Cappuccino',
    price: 4.99,
    category: 'Coffee',
    stock: 45,
    lowStockThreshold: 10,
    description: 'Creamy cappuccino with steamed milk'
  },
  {
    id: '3',
    name: 'Croissant',
    price: 3.49,
    category: 'Pastry',
    stock: 25,
    lowStockThreshold: 5,
    description: 'Buttery, flaky croissant'
  },
  {
    id: '4',
    name: 'Latte',
    price: 5.49,
    category: 'Coffee',
    stock: 40,
    lowStockThreshold: 10,
    description: 'Smooth latte with steamed milk'
  },
  {
    id: '5',
    name: 'Blueberry Muffin',
    price: 2.99,
    category: 'Pastry',
    stock: 15,
    lowStockThreshold: 5,
    description: 'Fresh blueberry muffin'
  },
  {
    id: '6',
    name: 'Green Tea',
    price: 3.99,
    category: 'Tea',
    stock: 30,
    lowStockThreshold: 8,
    description: 'Premium green tea'
  }
];

const mockSales: Sale[] = [
  {
    id: 'sale-1',
    items: [
      { ...mockProducts[0], quantity: 2, subtotal: 5.98, originalPrice: mockProducts[0].price, unitPrices: [mockProducts[0].price, mockProducts[0].price] },
      { ...mockProducts[2], quantity: 1, subtotal: 3.49, originalPrice: mockProducts[2].price, unitPrices: [mockProducts[2].price] }
    ],
    total: 9.47,
    tax: 0.85,
    discount: 0,
    paymentMethod: 'card',
    timestamp: new Date(Date.now() - 86400000), // Yesterday
    cashierId: 'user-1'
  }
];

export const usePOSStore = create<POSState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        products: mockProducts,
        filteredProducts: mockProducts,
        cart: [],
        cartTotal: 0,
        cartTax: 0,
        cartDiscount: 0,
        cartSubtotal: 0,
        sales: mockSales,
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
            const tax = subtotal * 0.09;
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
            const tax = subtotal * 0.09; // 9% tax
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
          const tax = subtotal * 0.09;
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
          const tax = subtotal * 0.09;
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
          const tax = subtotal * 0.09;
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
          const tax = subtotal * 0.09;
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

        // Product actions
        addProduct: (product) => {
          const newProduct: Product = {
            ...product,
            id: Date.now().toString()
          };
          set(state => ({
            products: [...state.products, newProduct]
          }));
          get().filterProducts();
        },

        updateProduct: (id, updates) => {
          set(state => ({
            products: state.products.map(product =>
              product.id === id ? { ...product, ...updates } : product
            )
          }));
          get().filterProducts();
        },

        deleteProduct: (id) => {
          set(state => ({
            products: state.products.filter(product => product.id !== id)
          }));
          get().filterProducts();
        },

        updateStock: (id, quantity) => {
          get().updateProduct(id, { stock: quantity });
        },

        // Search and filter
        setSearchQuery: (query) => {
          set({ searchQuery: query });
          get().filterProducts();
        },

        setSelectedCategory: (category) => {
          set({ selectedCategory: category });
          get().filterProducts();
        },

        filterProducts: () => {
          const { products, searchQuery, selectedCategory } = get();
          let filtered = products;

          if (selectedCategory !== 'All') {
            filtered = filtered.filter(product => product.category === selectedCategory);
          }

          if (searchQuery) {
            filtered = filtered.filter(product =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          set({ filteredProducts: filtered });
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

          // Update stock
          cart.forEach(item => {
            get().updateStock(item.id, item.stock - item.quantity);
          });

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
          products: state.products,
          sales: state.sales,
          currentUser: state.currentUser
        })
      }
    )
  )
);