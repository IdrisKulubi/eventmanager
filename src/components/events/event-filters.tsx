'use client';

import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";
import { CategoryFilters } from "./category-filters";
import { PriceRangeSlider } from "./price-range-slider";

interface EventFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export function EventFilters({
  dateRange,
  onDateRangeChange,
  selectedCategories,
  onCategoriesChange,
  priceRange,
  onPriceRangeChange,
}: EventFiltersProps) {
  const categories = [
    { id: 'rock', name: 'Rock', count: 18 },
    { id: 'pop', name: 'Pop', count: 24 },
    { id: 'electronic', name: 'Electronic', count: 15 },
    { id: 'hiphop', name: 'Hip Hop', count: 12 },
    { id: 'jazz', name: 'Jazz', count: 8 },
    { id: 'classical', name: 'Classical', count: 5 },
    { id: 'indie', name: 'Indie', count: 10 },
    { id: 'metal', name: 'Metal', count: 6 },
  ];

  return (
    <div className="space-y-6 p-4 bg-zinc-900/50 rounded-lg border border-purple-900/30">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Date Range</h3>
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Categories</h3>
        <CategoryFilters
          categories={categories}
          selectedCategories={selectedCategories}
          onChange={onCategoriesChange}
        />
      </div>

      <div className="space-y-4">
        <PriceRangeSlider
          value={priceRange}
          onChange={onPriceRangeChange}
          min={0}
          max={1000}
          step={10}
        />
      </div>
    </div>
  );
} 