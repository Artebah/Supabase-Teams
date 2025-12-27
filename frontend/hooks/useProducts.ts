import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProductsStore } from "@/zustand/useProductsStore";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductsQueryParams,
} from "@/types/products.api";
import { toast } from "react-toastify";
import { toastSupabaseError } from "@/utils/toastSupabaseError";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function useProducts(teamId?: string) {
  const supabase = createClient();
  const {
    products,
    pagination,
    filters,
    isLoading,
    error,
    setProducts,
    setLoading,
    setError,
    setFilters,
  } = useProductsStore();

  const fetchProducts = useCallback(
    async (customFilters?: Partial<ProductsQueryParams>) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = { ...filters, ...customFilters };
        if (teamId) {
          queryParams.team_id = teamId;
        }

        const searchParams = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        const { data, error } = await supabase.functions.invoke(
          `products?${searchParams.toString()}`,
          { method: "GET" }
        );

        if (error) {
          toastSupabaseError(error);
          return;
        }

        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        toast.error("Failed to load products");
      }
    },
    []
  );

  const createProduct = async (dto: CreateProductDto) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${SUPABASE_URL}/functions/v1/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const product = await response.json();
      toast.success("Product created successfully");
      await fetchProducts();
      return product;
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create product"
      );
      throw err;
    }
  };

  const updateProduct = async (productId: string, dto: UpdateProductDto) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dto),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const product = await response.json();
      toast.success("Product updated successfully");
      await fetchProducts();
      return product;
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update product"
      );
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      toast.success("Product deleted successfully");
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product"
      );
      throw err;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to upload image");
      throw err;
    }
  };

  const changePage = (page: number) => {
    setFilters({ page });
  };

  const changeFilters = (newFilters: Partial<ProductsQueryParams>) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  useEffect(() => {
    if (teamId) {
      fetchProducts();
    }
  }, [
    fetchProducts,
    teamId,
    filters.page,
    filters.status,
    filters.created_by,
    filters.search,
    filters.sort_by,
    filters.sort_order,
  ]);

  return {
    products,
    pagination,
    filters,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    changePage,
    changeFilters,
  };
}
