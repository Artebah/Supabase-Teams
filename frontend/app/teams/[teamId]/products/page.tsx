"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import useProfileStore from "@/zustand/useProfileStore";
import { ProductCard } from "@/components/product-card";
import { ProductForm } from "@/components/product-form";
import { ProductFilters } from "@/components/product-filters";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import {
  ProductWithCreator,
  CreateProductDto,
  UpdateProductDto,
  Product,
} from "@/types/products.api";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

export interface ActivateProductModalData {
  open: boolean;
  product: Product | null;
}

export interface DeleteProductModalData {
  open: boolean;
  product: Product | null;
}

export default function ProductsPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const { profile } = useProfileStore();
  const { teamMembers } = useTeamMembers();
  const {
    products,
    pagination,
    filters,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    changePage,
    changeFilters,
  } = useProducts(teamId);

  const [activateProductModalData, setActivateProductModalData] =
    useState<ActivateProductModalData>({
      open: false,
      product: null,
    });
  const [deleteProductModalData, setDeleteProductModalData] =
    useState<DeleteProductModalData>({
      open: false,
      product: null,
    });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithCreator | null>(null);

  const handleCreateProduct = async (data: CreateProductDto) => {
    await createProduct(data);
    setShowCreateForm(false);
  };

  const handleUpdateProduct = async (data: UpdateProductDto) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      setEditingProduct(null);
    }
  };

  const handleFormSubmit = async (
    data: CreateProductDto | UpdateProductDto
  ) => {
    if (editingProduct) {
      await handleUpdateProduct(data as UpdateProductDto);
    } else {
      await handleCreateProduct(data as CreateProductDto);
    }
  };

  const onDeleteModalOpen = (data: DeleteProductModalData) => {
    setDeleteProductModalData(data);
  };

  const handleDeleteProductConfirm = async () => {
    if (deleteProductModalData.product) {
      const response = await deleteProduct(deleteProductModalData.product.id);

      if (!response.error) {
        // Delay before clearing the modal to avoid showing empty title
        setTimeout(() => {
          setDeleteProductModalData({ open: false, product: null });
        }, 300);
      }
    }
  };

  const onActivateModalOpen = (data: ActivateProductModalData) => {
    setActivateProductModalData(data);
  };

  const handleActivateProduct = async () => {
    if (activateProductModalData.product) {
      const response = await updateProduct(
        activateProductModalData.product.id,
        {
          status: "Active",
        }
      );

      if (!response.error) {
        setActivateProductModalData({
          open: false,
          product: activateProductModalData.product,
        });
        setTimeout(() => {
          setActivateProductModalData({ open: false, product: null });
        }, 300);
      }
    }
  };

  const handleEditProduct = (product: ProductWithCreator) => {
    setEditingProduct(product);
  };

  return (
    <>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 max-lg:flex-col max-lg:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-gray-600">
              Manage your team&apos;s products - create, edit, and organize
              them.
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Product
          </Button>
        </div>

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingProduct) && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </h2>
            <ProductForm
              teamId={teamId}
              product={editingProduct || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingProduct(null);
              }}
              onUploadImage={uploadImage}
            />
          </Card>
        )}

        {/* Filters */}
        <div className="mb-6">
          <ProductFilters
            filters={filters}
            onFiltersChange={changeFilters}
            teamMembers={teamMembers}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status || filters.created_by
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first product."}
            </p>
            {!filters.search && !filters.status && !filters.created_by && (
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Product
              </Button>
            )}
          </Card>
        )}

        {/* Products List */}
        {!isLoading && products.length > 0 && (
          <>
            <div className="space-y-4 mb-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={onDeleteModalOpen}
                  onActivateModalOpen={onActivateModalOpen}
                  currentUserId={profile?.id}
                />
              ))}
            </div>

            {/* Pagination Info */}
            {pagination && (
              <div className="text-center text-sm text-gray-600 mb-4">
                Showing {products.length} of {pagination.total} products
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={changePage}
              />
            )}
          </>
        )}
      </div>

      <Dialog
        open={activateProductModalData.open}
        onOpenChange={(open) => {
          if (open === false) {
            setActivateProductModalData({
              open,
              product: activateProductModalData.product,
            });
            setTimeout(() => {
              setActivateProductModalData({ open: false, product: null });
            }, 300);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Activate product:{" "}
              <span className="font-bold">
                {activateProductModalData.product?.title}
              </span>
              ?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to activate this product? You won&apos;t be
            able to edit it afterwards.
          </DialogDescription>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleActivateProduct}>Activate</Button>
            <Button
              onClick={() => {
                setActivateProductModalData({
                  open: false,
                  product: activateProductModalData.product,
                });
                setTimeout(() => {
                  setActivateProductModalData({ open: false, product: null });
                }, 300);
              }}
              variant="outline">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteProductModalData.open}
        onOpenChange={(open) => {
          if (open === false) {
            setDeleteProductModalData({
              open,
              product: deleteProductModalData.product,
            });
            setTimeout(() => {
              setDeleteProductModalData({ open: false, product: null });
            }, 300);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete product:{" "}
              <span className="font-bold">
                {deleteProductModalData.product?.title}
              </span>
              ?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogDescription>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleDeleteProductConfirm} variant="destructive">
              Delete
            </Button>
            <Button
              onClick={() => {
                setDeleteProductModalData({
                  open: false,
                  product: deleteProductModalData.product,
                });
                setTimeout(() => {
                  setDeleteProductModalData({ open: false, product: null });
                }, 300);
              }}
              variant="outline">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
