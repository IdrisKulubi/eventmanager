'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isCollapsed: false,
  toggleSidebar: () => {},
  toggleCollapse: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  // For mobile sidebar (hidden/shown)
  const [isOpen, setIsOpen] = useState(false);
  
  // For desktop sidebar (expanded/collapsed)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check for saved collapsed state on mount
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsedState) {
      setIsCollapsed(savedCollapsedState === "true");
    }
  }, []);

  // Close sidebar on screen resize if it was open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    localStorage.setItem("sidebarCollapsed", newCollapsedState.toString());
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        toggleSidebar,
        toggleCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
} 