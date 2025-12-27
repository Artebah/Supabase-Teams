export interface Product {
  id: string;
  team_id: string;
  created_by: string;
  title: string;
  description: string | null;
  image: string | null;
  status: "Draft" | "Active" | "Deleted";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductWithCreator extends Product {
  creator_name: string;
  creator_avatar: string | null;
}

export interface CreateProductDto {
  title: string;
  description?: string;
  image?: string;
  team_id: string;
}

export interface UpdateProductDto {
  title?: string;
  description?: string;
  image?: string;
  status?: "Draft" | "Active" | "Deleted";
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  status?: "Draft" | "Active" | "Deleted";
  created_by?: string;
  search?: string;
  sort_by?: "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
  team_id?: string;
}

export interface ProductsListResponse {
  data: ProductWithCreator[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
