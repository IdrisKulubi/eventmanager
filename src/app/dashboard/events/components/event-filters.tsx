"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { eventCategories } from "@/db/schema";

// Define the type based on the schema
type Category = typeof eventCategories.$inferSelect;

interface EventFiltersProps {
  categories: Category[];
}

export default function EventFilters({ categories }: EventFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Get the current filters from URL
  const currentStatus = searchParams.get("status") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "startDate-desc";
  
  // State for filters
  const [status, setStatus] = useState(currentStatus);
  const [category, setCategory] = useState(currentCategory);
  const [search, setSearch] = useState(currentSearch);
  const [sort, setSort] = useState(currentSort);
  
  // Update URL when filters change
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    // Reset pagination when filters change
    newSearchParams.set("page", "1");
    
    // Update or delete parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    
    return newSearchParams.toString();
  };
  
  const applyFilters = () => {
    startTransition(() => {
      const queryString = createQueryString({
        status,
        category,
        search,
        sort,
      });
      
      router.push(`${pathname}?${queryString}`);
    });
  };
  
  const resetFilters = () => {
    setStatus("");
    setCategory("");
    setSearch("");
    setSort("startDate-desc");
    
    startTransition(() => {
      router.push(pathname);
    });
  };
  
  // Apply filters on input change with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search, status, category, sort]);
  
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search events..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                variant="ghost"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setSearch("")}
              >
                <XMarkIcon className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sort">Sort By</Label>
          <Select
            value={sort}
            onValueChange={setSort}
          >
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startDate-desc">Date (newest)</SelectItem>
              <SelectItem value="startDate-asc">Date (oldest)</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Created (newest)</SelectItem>
              <SelectItem value="createdAt-asc">Created (oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          disabled={isPending}
          className="ml-2"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
} 