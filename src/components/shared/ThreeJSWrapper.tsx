'use client';

import React, { useEffect, useState } from 'react';

interface ThreeJSWrapperProps {
  children: React.ReactNode;
}

const ThreeJSWrapper = ({ children }: ThreeJSWrapperProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure this component only renders on the client to prevent hydration issues
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-t-transparent border-purple-500 animate-spin"></div>
      </div>
    );
  }

  return <div className="relative w-full h-full">{children}</div>;
};

export default ThreeJSWrapper; 