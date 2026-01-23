import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardLayoutState {
  isEditMode: boolean;
  layout: string[];
  hiddenWidgets: string[];
  toggleEditMode: () => void;
  updateLayout: (newLayout: string[]) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resetLayout: () => void;
}

export const defaultLayout = [
  'stats-cards',
  'sales-metrics',
  'top-products-metrics',
  'profit-metrics',
  'sales-by-category',
  'payment-methods',
  'sales-chart',
  'top-products-list',
];

export const widgetLabels: Record<string, string> = {
  'stats-cards': 'Tarjetas de Estadísticas',
  'sales-metrics': 'Métricas de Ventas',
  'top-products-metrics': 'Top Productos (Métricas)',
  'profit-metrics': 'Métricas de Ganancias',
  'sales-by-category': 'Ventas por Categoría',
  'payment-methods': 'Métodos de Pago',
  'sales-chart': 'Gráfico de Ventas',
  'top-products-list': 'Lista de Top Productos',
};

export const useDashboardStore = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      isEditMode: false,
      layout: defaultLayout,
      hiddenWidgets: [],
      toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
      updateLayout: (newLayout) => set({ layout: newLayout }),
      toggleWidgetVisibility: (widgetId) =>
        set((state) => {
          const isHidden = state.hiddenWidgets.includes(widgetId);
          return {
            hiddenWidgets: isHidden
              ? state.hiddenWidgets.filter((id) => id !== widgetId)
              : [...state.hiddenWidgets, widgetId],
          };
        }),
      resetLayout: () => set({ layout: defaultLayout, hiddenWidgets: [] }),
    }),
    {
      name: 'dashboard-layout',
    }
  )
);
