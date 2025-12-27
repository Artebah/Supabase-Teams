"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductWithCreator,
} from "@/types/products.api";
import { X } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  teamId: string;
  product?: ProductWithCreator;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  onCancel: () => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function ProductForm({
  teamId,
  product,
  onSubmit,
  onCancel,
  onUploadImage,
}: ProductFormProps) {
  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [image, setImage] = useState(product?.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isEditMode = !!product;
  const canEdit = !product || product.status === "Draft";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploadingImage(true);
      const imageUrl = await onUploadImage(file);
      setImage(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode) {
        await onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          image: image || undefined,
        });
      } else {
        await onSubmit({
          team_id: teamId,
          title: title.trim(),
          description: description.trim() || undefined,
          image: image || undefined,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="title">
          Title *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter product title"
          required
          disabled={!canEdit || isSubmitting}
        />
      </div>

      <div>
        <Label className="mb-2" htmlFor="description">
          Description
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
          disabled={!canEdit || isSubmitting}
          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <Label className="mb-2" htmlFor="image">
          Image
        </Label>
        <div className="space-y-2 max-w-2xl">
          {image && (
            <div className="relative w-full h-72 rounded-md overflow-hidden border">
              <Image
                src={image}
                alt="Product preview"
                fill
                className="object-cover"
                unoptimized={
                  image.includes("127.0.0.1") || image.includes("localhost")
                }
              />
              {canEdit && !isSubmitting && (
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {canEdit && !image && (
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage || isSubmitting}
                className="flex-1"
              />
              {isUploadingImage && <Spinner className="w-5 h-5" />}
            </div>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          You can only edit products in Draft status
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canEdit || isSubmitting || isUploadingImage}>
          {isSubmitting ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditMode ? "Update" : "Create"} Product</>
          )}
        </Button>
      </div>
    </form>
  );
}
