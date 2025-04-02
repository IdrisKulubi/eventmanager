'use client';

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface PriceRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step: number;
}

export function PriceRangeSlider({ value, onChange, min, max, step }: PriceRangeSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Label className="text-sm font-medium text-white">Price Range</Label>
        <span className="text-sm text-zinc-400">
          ${value[0]} - ${value[1]}
        </span>
      </div>
      <Slider
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600 [&_[role=slider]]:hover:bg-purple-700 [&_[role=slider]]:hover:border-purple-700 [&_[role=slider]]:focus:ring-purple-600/20 [&_[role=slider]]:focus:ring-offset-zinc-900"
      />
    </div>
  );
} 