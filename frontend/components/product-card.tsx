"use client";

import { ProductWithCreator } from "@/types/products.api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  ActivateProductModalData,
  DeleteProductModalData,
} from "@/app/teams/[teamId]/products/page";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithCreator;
  onEdit: (product: ProductWithCreator) => void;
  onDelete: (data: DeleteProductModalData) => void;
  onActivateModalOpen: (data: ActivateProductModalData) => void;
  currentUserId?: string;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onActivateModalOpen,
  currentUserId,
}: ProductCardProps) {
  const isOwner = currentUserId === product.created_by;
  const canEdit = product.status === "Draft";
  const canActivate = product.status === "Draft";
  const canDelete = product.status !== "Deleted";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4 max-sm:flex-col">
        {/* Image */}
        <div
          className={cn(
            "w-full h-60 sm:size-24 shrink-0 rounded-md overflow-hidden bg-gray-100 relative",
            { "max-sm:hidden": !product.image }
          )}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized={
                product.image.includes("127.0.0.1") ||
                product.image.includes("localhost")
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg truncate">{product.title}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                product.status
              )}`}>
              {product.status}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Avatar className="w-6 h-6">
              {product.creator_avatar ? (
                <Image
                  src={product.creator_avatar}
                  alt={product.creator_name}
                  width={24}
                  height={24}
                  className="object-cover"
                  unoptimized={
                    product.creator_avatar.includes("127.0.0.1") ||
                    product.creator_avatar.includes("localhost")
                  }
                />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">
                  {product.creator_name.charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>
            <span>{product.creator_name}</span>
            <span className="max-sm:hidden">•</span>
            <span className="max-sm:hidden">
              {formatDistanceToNow(new Date(product.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <span className="sm:hidden block mb-4 text-sm text-gray-500">
            {formatDistanceToNow(new Date(product.created_at), {
              addSuffix: true,
            })}
          </span>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(product)}
                disabled={!isOwner}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {canActivate && isOwner && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onActivateModalOpen({ open: true, product })}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Activate
              </Button>
            )}
            {canDelete && isOwner && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete({ open: true, product })}
                className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
