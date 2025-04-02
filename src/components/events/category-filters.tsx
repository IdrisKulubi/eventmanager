'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFiltersProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export function CategoryFilters({ categories, selectedCategories, onChange }: CategoryFiltersProps) {
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedCategories, categoryId]);
    } else {
      onChange(selectedCategories.filter(id => id !== categoryId));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={category.id}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
              className="border-purple-900/50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <Label
              htmlFor={category.id}
              className="text-sm text-zinc-300 hover:text-white cursor-pointer"
            >
              {category.name} ({category.count})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
} 