import { create } from "zustand";
import {
  ProductWithCreator,
  ProductsListResponse,
  ProductsQueryParams,
} from "@/types/products.api";

interface ProductsState {
  products: ProductWithCreator[];
  currentProduct: ProductWithCreator | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  filters: ProductsQueryParams;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProducts: (response: ProductsListResponse) => void;
  setCurrentProduct: (product: ProductWithCreator | null) => void;
  addProduct: (product: ProductWithCreator) => void;
  updateProduct: (
    productId: string,
    updates: Partial<ProductWithCreator>
  ) => void;
  removeProduct: (productId: string) => void;
  setFilters: (filters: Partial<ProductsQueryParams>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
}

const initialFilters: ProductsQueryParams = {
  page: 1,
  limit: 10,
  sort_by: "created_at",
  sort_order: "desc",
};

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  currentProduct: null,
  pagination: null,
  filters: initialFilters,
  isLoading: false,
  error: null,

  setProducts: (response) =>
    set({
      products: response.data,
      pagination: response.pagination,
      isLoading: false,
      error: null,
    }),

  setCurrentProduct: (product) => set({ currentProduct: product }),

  addProduct: (product) =>
    set((state) => ({
      products: [product, ...state.products],
    })),

  updateProduct: (productId, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
      currentProduct:
        state.currentProduct?.id === productId
          ? { ...state.currentProduct, ...updates }
          : state.currentProduct,
    })),

  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearState: () =>
    set({
      products: [],
      currentProduct: null,
      pagination: null,
      filters: initialFilters,
      isLoading: false,
      error: null,
    }),
}));
