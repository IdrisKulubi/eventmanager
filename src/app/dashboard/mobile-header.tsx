"use client";

import Link from "next/link";
import { useSidebar } from "./sidebar-context";

export function MobileHeader() {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <header className="fixed inset-x-0 z-20 flex items-center h-16 bg-white border-b lg:hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between w-full px-4">
        <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white">
          EventManager
        </Link>
        
        <button 
          type="button"
          onClick={toggleSidebar}
          className="p-2 text-gray-500 rounded-md lg:hidden dark:text-gray-400"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
} 