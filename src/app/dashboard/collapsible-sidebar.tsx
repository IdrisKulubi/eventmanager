'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { ModeToggle } from "@/components/shared/theme/theme-toggle";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

interface SidebarProps {
  navigation: NavItem[];
  user: {
    name?: string | null;
    image?: string | null;
    role?: string | null;
  } | undefined;
  signOut: () => Promise<void>;
}

export function CollapsibleSidebar({ navigation, user, signOut }: SidebarProps) {
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapse } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10 bg-gray-900/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-20 flex flex-col flex-shrink-0 
          overflow-y-auto transition-all duration-300 transform 
          bg-white border-r shadow-lg lg:shadow-none dark:bg-gray-800 dark:border-gray-700
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
          w-64 lg:static lg:z-10
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-primary">
          <Link 
            href="/dashboard" 
            className={`${isCollapsed ? 'lg:hidden' : ''} text-xl font-bold tracking-wider text-white uppercase`}
          >
            {!isCollapsed && "EventManager"}
          </Link>
          
          {/* Toggle collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-1 text-white rounded-md"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center p-2 transition-colors rounded-md
                      ${isActive 
                        ? 'bg-primary-50 text-primary dark:bg-gray-700 dark:text-primary-light' 
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }
                      ${isCollapsed ? 'lg:justify-center' : ''}
                    `}
                  >
                    <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: item.icon }} />
                    <span className={`${isCollapsed ? 'lg:hidden' : 'ml-3'}`}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Theme Toggle */}
        <div className={`
          border-t px-4 py-3 dark:border-gray-700
          ${isCollapsed ? 'lg:flex lg:justify-center' : 'flex justify-end'}
        `}>
          <ModeToggle />
        </div>
        
        {/* User profile */}
        <div className={`
          flex items-center border-t p-4 dark:border-gray-700
          ${isCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between'}
        `}>
          <form action={signOut}>
            <button 
              type="submit"
              className="p-2 text-gray-500 rounded-md hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
          
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex-shrink-0">
              <Image 
                src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                alt={user?.name || "User"} 
                className="w-10 h-10 rounded-full" 
                width={40}
                height={40}
              />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
} 