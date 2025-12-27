"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ProductsQueryParams } from "@/types/products.api";

interface ProductFiltersProps {
  filters: ProductsQueryParams;
  onFiltersChange: (filters: Partial<ProductsQueryParams>) => void;
  teamMembers?: Array<{ id: string; name: string }>;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  teamMembers = [],
}: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ search: searchInput || undefined });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, filters.search, onFiltersChange]);

  const handleClearFilters = () => {
    setSearchInput("");
    onFiltersChange({
      status: undefined,
      created_by: undefined,
      search: undefined,
      sort_by: "created_at",
      sort_order: "desc",
    });
  };

  const hasActiveFilters =
    filters.status || filters.created_by || filters.search;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="gap-2">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  onFiltersChange({
                    status: e.target.value
                      ? (e.target.value as "Draft" | "Active" | "Deleted")
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border rounded-md">
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Deleted">Deleted</option>
              </select>
            </div>

            {/* Creator Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Created By
              </label>
              <select
                value={filters.created_by || ""}
                onChange={(e) =>
                  onFiltersChange({
                    created_by: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border rounded-md">
                <option value="">All Members</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={filters.sort_by || "created_at"}
                  onChange={(e) =>
                    onFiltersChange({
                      sort_by: e.target.value as "created_at" | "updated_at",
                    })
                  }
                  className="flex-1 px-3 py-2 border rounded-md">
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                </select>
                <select
                  value={filters.sort_order || "desc"}
                  onChange={(e) =>
                    onFiltersChange({
                      sort_order: e.target.value as "asc" | "desc",
                    })
                  }
                  className="px-3 py-2 border rounded-md">
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
