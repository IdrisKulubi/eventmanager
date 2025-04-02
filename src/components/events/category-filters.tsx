'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count: number;
}

export function CategoryFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const categories: Category[] = [
    { id: 'rock', name: 'Rock', count: 18 },
    { id: 'pop', name: 'Pop', count: 24 },
    { id: 'electronic', name: 'Electronic', count: 15 },
    { id: 'hiphop', name: 'Hip Hop', count: 12 },
    { id: 'jazz', name: 'Jazz', count: 8 },
    { id: 'classical', name: 'Classical', count: 5 },
    { id: 'indie', name: 'Indie', count: 10 },
    { id: 'metal', name: 'Metal', count: 6 },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prevSelected => 
      prevSelected.includes(categoryId)
        ? prevSelected.filter(id => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        
        return (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`
              w-full flex items-center justify-between py-2 px-3 rounded-md text-sm 
              transition-all duration-300
              ${isSelected 
                ? 'bg-purple-700/30 text-purple-200 border border-purple-600/40' 
                : 'text-zinc-300 hover:bg-purple-800/20 border border-transparent'
              }
            `}
          >
            <div className="flex items-center">
              {isSelected ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-purple-500" />
              ) : (
                <div className={`w-4 h-4 mr-2 rounded-full border ${isSelected ? 'border-purple-500' : 'border-zinc-600'}`} />
              )}
              <span>{category.name}</span>
            </div>
            <span className={`text-xs rounded-full px-2 py-0.5 ${
              isSelected 
                ? 'bg-purple-800 text-purple-300' 
                : 'bg-zinc-800 text-zinc-500'
            }`}>
              {category.count}
            </span>
          </button>
        );
      })}
      
      {selectedCategories.length > 0 && (
        <button 
          onClick={() => setSelectedCategories([])}
          className="mt-3 w-full text-center text-xs text-purple-400 hover:text-purple-300 py-1"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
} 