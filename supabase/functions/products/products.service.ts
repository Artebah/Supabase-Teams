import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateProductDto,
  Product,
  ProductsQueryParams,
  ProductsListResponse,
  UpdateProductDto,
  ProductWithCreator,
} from "./products.dto.ts";

export class ProductsService {
  constructor(private supabase: SupabaseClient) {}

  async createProduct(userId: string, dto: CreateProductDto): Promise<Product> {
    const { data, error } = await this.supabase
      .from("products")
      .insert({
        team_id: dto.team_id,
        created_by: userId,
        title: dto.title,
        description: dto.description || null,
        image: dto.image || null,
        status: "Draft",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data;
  }

  async getProduct(productId: string): Promise<ProductWithCreator> {
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        profiles!products_created_by_fkey (
          name,
          avatar_url
        )
      `
      )
      .eq("id", productId)
      .single();

    if (error) {
      throw new Error(`Failed to get product: ${error.message}`);
    }

    return {
      ...data,
      creator_name: data.profiles?.name || "Unknown",
      creator_avatar: data.profiles?.avatar_url || null,
    };
  }

  async listProducts(
    params: ProductsQueryParams
  ): Promise<ProductsListResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      created_by,
      search,
      sort_by = "created_at",
      sort_order = "desc",
      team_id,
    } = params;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase.from("products").select(
      `
        *,
        profiles!products_created_by_fkey (
          name,
          avatar_url
        )
      `,
      { count: "exact" }
    );

    // Apply filters
    if (team_id) {
      query = query.eq("team_id", team_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (created_by) {
      query = query.eq("created_by", created_by);
    }

    if (search?.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === "asc" });

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list products: ${error.message}`);
    }

    interface DbProduct {
      profiles?: { name?: string; avatar_url?: string | null };
      [key: string]: unknown;
    }

    const products: ProductWithCreator[] = (data || []).map(
      (item: DbProduct) => ({
        ...(item as unknown as Product),
        creator_name: item.profiles?.name || "Unknown",
        creator_avatar: item.profiles?.avatar_url || null,
      })
    );

    return {
      data: products,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async updateProduct(
    productId: string,
    dto: UpdateProductDto
  ): Promise<Product> {
    // First, check if product can be updated
    const { data: existingProduct, error: fetchError } = await this.supabase
      .from("products")
      .select("status")
      .eq("id", productId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`);
    }

    // If trying to update fields other than status, check if product is in Draft
    const isOnlyStatusUpdate =
      Object.keys(dto).length === 1 && dto.status !== undefined;

    if (!isOnlyStatusUpdate && existingProduct.status !== "Draft") {
      throw new Error("Can only edit products in Draft status");
    }

    const { data, error } = await this.supabase
      .from("products")
      .update(dto)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data;
  }

  async deleteProduct(productId: string): Promise<void> {
    // Soft delete - change status to 'Deleted'
    const { error } = await this.supabase
      .from("products")
      .update({ status: "Deleted" })
      .eq("id", productId);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async hardDeleteOldProducts(): Promise<number> {
    // Delete products with status 'Deleted' older than 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data, error } = await this.supabase
      .from("products")
      .delete()
      .eq("status", "Deleted")
      .lt("deleted_at", twoWeeksAgo.toISOString())
      .select("id");

    if (error) {
      throw new Error(`Failed to hard delete products: ${error.message}`);
    }

    return data?.length || 0;
  }

  async uploadProductImage(file: File, productId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data } = this.supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
