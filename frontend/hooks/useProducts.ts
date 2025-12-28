import { useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProductsStore } from "@/zustand/useProductsStore";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductsQueryParams,
} from "@/types/products.api";
import { toast } from "react-toastify";
import { toastSupabaseError } from "@/utils/toastSupabaseError";

export function useProducts(teamId?: string) {
  const supabase = useMemo(() => createClient(), []);
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
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
  }, [setError, setLoading, setProducts, supabase, filters]);

  const createProduct = async (dto: CreateProductDto) => {
    const { error } = await supabase.functions.invoke(`products`, {
      method: "POST",
      body: JSON.stringify(dto),
    });

    if (error) {
      toastSupabaseError(error);
    }

    toast.success("Product created successfully");
    await fetchProducts();
  };

  const updateProduct = async (productId: string, dto: UpdateProductDto) => {
    const { error } = await supabase.functions.invoke(`products/${productId}`, {
      method: "PATCH",

      body: JSON.stringify(dto),
    });

    if (error) {
      toastSupabaseError(error);
    }

    toast.success("Product updated successfully");
    await fetchProducts();
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.functions.invoke(`products/${productId}`, {
      method: "DELETE",
    });

    if (error) {
      toastSupabaseError(error);
    }

    toast.success("Product deleted successfully");
    await fetchProducts();
  };

  //! Move to backend
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
  //!

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
  }, [fetchProducts, teamId]);

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
