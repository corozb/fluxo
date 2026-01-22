import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CategoriesState {
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

const defaultCategories = ['Coffee', 'Tea', 'Pastry', 'Sandwich', 'Salad', 'Beverage', 'Snack'];

export const useCategoriesStore = create<CategoriesState>()(
  devtools(
    persist(
      (set, get) => ({
        categories: defaultCategories,

        addCategory: (category) => {
          const { categories } = get();
          const trimmedCategory = category.trim();
          if (trimmedCategory && !categories.includes(trimmedCategory)) {
            set({ categories: [...categories, trimmedCategory] });
          }
        },

        deleteCategory: (category) => {
          const { categories } = get();
          set({ categories: categories.filter(c => c !== category) });
        }
      }),
      {
        name: 'categories-storage'
      }
    )
  )
);
