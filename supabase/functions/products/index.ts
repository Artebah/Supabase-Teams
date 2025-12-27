import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabaseClient.ts";
import { ProductsService } from "./products.service.ts";
import {
  CreateProductDto,
  ProductsQueryParams,
  UpdateProductDto,
} from "./products.dto.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createSupabaseClient(req);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productsService = new ProductsService(supabaseClient);
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Remove 'products' from pathParts if it exists
    const productIdOrAction = pathParts[pathParts.length - 1];

    // GET /products - List products with filters
    if (req.method === "GET" && !productIdOrAction.match(/^[0-9a-f-]{36}$/i)) {
      const statusParam = url.searchParams.get("status");
      const sortByParam = url.searchParams.get("sort_by");
      const sortOrderParam = url.searchParams.get("sort_order");

      const queryParams: ProductsQueryParams = {
        page: Number(url.searchParams.get("page")) || 1,
        limit: Number(url.searchParams.get("limit")) || 10,
        status:
          statusParam === "Draft" ||
          statusParam === "Active" ||
          statusParam === "Deleted"
            ? statusParam
            : undefined,
        created_by: url.searchParams.get("created_by") || undefined,
        search: url.searchParams.get("search") || undefined,
        sort_by:
          sortByParam === "created_at" || sortByParam === "updated_at"
            ? sortByParam
            : "created_at",
        sort_order:
          sortOrderParam === "asc" || sortOrderParam === "desc"
            ? sortOrderParam
            : "desc",
        team_id: url.searchParams.get("team_id") || undefined,
      };

      const result = await productsService.listProducts(queryParams);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /products/:id - Get single product
    if (req.method === "GET" && productIdOrAction.match(/^[0-9a-f-]{36}$/i)) {
      const product = await productsService.getProduct(productIdOrAction);

      return new Response(JSON.stringify(product), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /products - Create new product
    if (req.method === "POST") {
      const dto: CreateProductDto = await req.json();

      if (!dto.title || !dto.team_id) {
        return new Response(
          JSON.stringify({ error: "Title and team_id are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const product = await productsService.createProduct(user.id, dto);

      return new Response(JSON.stringify(product), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PATCH /products/:id - Update product
    if (req.method === "PATCH" && productIdOrAction.match(/^[0-9a-f-]{36}$/i)) {
      const dto: UpdateProductDto = await req.json();

      const product = await productsService.updateProduct(
        productIdOrAction,
        dto
      );

      return new Response(JSON.stringify(product), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /products/:id - Soft delete product
    if (
      req.method === "DELETE" &&
      productIdOrAction.match(/^[0-9a-f-]{36}$/i)
    ) {
      await productsService.deleteProduct(productIdOrAction);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in products function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
