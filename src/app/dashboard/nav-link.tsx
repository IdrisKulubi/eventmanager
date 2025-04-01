'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
}

export function NavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "text-primary bg-primary/10 dark:text-white dark:bg-primary/20" 
          : "text-gray-600 hover:text-primary hover:bg-primary/5 dark:text-gray-300 dark:hover:text-white dark:hover:bg-primary/10"
      )}
    >
      <span className="w-5 h-5 mr-3" dangerouslySetInnerHTML={{ __html: icon }} />
      {children}
    </Link>
  );
} 