'use client';

import { useState } from 'react';
import { Search, Calendar, MapPin, X } from 'lucide-react';

export function EventSearch() {
  const [query, setQuery] = useState('');
  const [recentSearches] = useState([
    'Rock Concert',
    'Jazz Festival',
    'EDM Party',
    'Classical Music'
  ]);

  return (
    <div className="w-full relative">
      <div className="relative group">
        {/* Animated border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-30 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
        
        {/* Search input */}
        <div className="relative bg-black/40 backdrop-blur-xl rounded-full p-1 border border-purple-800/50">
          <div className="flex items-center">
            <div className="flex items-center flex-1 px-4">
              <Search className="h-5 w-5 text-purple-400" />
              <input 
                type="text" 
                placeholder="Search for concerts, artists, or venues..." 
                className="flex-1 bg-transparent border-none text-white pl-3 py-3 focus:outline-none placeholder:text-zinc-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="hidden md:flex items-center border-l border-zinc-700 px-4">
              <Calendar className="h-5 w-5 text-purple-400" />
              <select className="bg-transparent border-none text-white pl-3 py-3 focus:outline-none appearance-none cursor-pointer">
                <option value="" className="bg-zinc-900">Any Date</option>
                <option value="today" className="bg-zinc-900">Today</option>
                <option value="this-week" className="bg-zinc-900">This Week</option>
                <option value="this-month" className="bg-zinc-900">This Month</option>
                <option value="next-month" className="bg-zinc-900">Next Month</option>
              </select>
            </div>
            
            <div className="hidden md:flex items-center border-l border-zinc-700 px-4">
              <MapPin className="h-5 w-5 text-purple-400" />
              <select className="bg-transparent border-none text-white pl-3 py-3 focus:outline-none appearance-none cursor-pointer">
                <option value="" className="bg-zinc-900">Any Location</option>
                <option value="new-york" className="bg-zinc-900">New York</option>
                <option value="los-angeles" className="bg-zinc-900">Los Angeles</option>
                <option value="miami" className="bg-zinc-900">Miami</option>
                <option value="chicago" className="bg-zinc-900">Chicago</option>
              </select>
            </div>
            
            <button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-full px-6 py-3 font-medium hover:shadow-purple-500/20 hover:shadow-lg transition-all duration-300 min-w-[100px]">
              Search
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent searches */}
      {!query && (
        <div className="absolute mt-3 left-0 right-0 flex flex-wrap gap-2 justify-center">
          {recentSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => setQuery(search)}
              className="bg-purple-800/20 backdrop-blur-md text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-800/30 hover:bg-purple-800/40 transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 