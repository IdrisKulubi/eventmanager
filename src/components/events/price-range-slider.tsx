'use client';

import React, { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Label } from '@/components/ui/label';

export function PriceRangeSlider() {
  const [price, setPrice] = useState([0, 1000]);

  const handleValueChange = (newValue: number[]) => {
    setPrice(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-zinc-300">Price Range</Label>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-purple-400">$</span>
          <span className="text-sm font-medium text-white">{price[0]} - {price[1]}</span>
        </div>
      </div>
      
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={price}
        max={1000}
        step={10}
        onValueChange={handleValueChange}
      >
        <Slider.Track className="bg-zinc-800 relative grow rounded-full h-[3px] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-900/60 before:to-purple-500/60 before:rounded-full">
          <Slider.Range className="absolute bg-gradient-to-r from-purple-700 to-purple-500 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb 
          className="block w-5 h-5 bg-zinc-900 border-2 border-purple-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-zinc-800 transition"
          aria-label="Min price"
        />
        <Slider.Thumb 
          className="block w-5 h-5 bg-zinc-900 border-2 border-purple-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-zinc-800 transition"
          aria-label="Max price"
        />
      </Slider.Root>

      <div className="flex justify-between pt-1 items-center">
        <div className="text-xs text-zinc-500 font-medium">$0</div>
        <div className="text-xs text-zinc-500 font-medium">$1000+</div>
      </div>

      <button
        onClick={() => setPrice([0, 1000])}
        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        Reset price
      </button>
    </div>
  );
} 