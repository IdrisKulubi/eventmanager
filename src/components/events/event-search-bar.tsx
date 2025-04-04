'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function EventSearchBar({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (query) {
        params.set('query', query);
      } else {
        params.delete('query');
      }
      
      params.delete('page');
      
      router.push(`/events?${params.toString()}`);
    });
  };

  const clearSearch = () => {
    setQuery('');
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('query');
      params.delete('page');
      
      router.push(`/events?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <div className="relative group">
        <motion.div 
          className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 opacity-60 blur-sm group-hover:opacity-100 transition-opacity"
          animate={{ 
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <div className="relative flex items-center bg-zinc-900/90 rounded-lg border border-purple-500/30 px-4 py-2">
          <Search className="h-5 w-5 text-zinc-500 flex-shrink-0" />
          
          <input
            type="text"
            placeholder="Search for concerts, festivals, shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-zinc-500 px-3 py-1.5"
          />
          
          <AnimatePresence>
            {query && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            type="submit"
            disabled={isPending}
            className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md px-4 py-1.5 text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
          >
            {isPending ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>
    </form>
  );
} 