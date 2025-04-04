import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { ThemeProvider } from '@/components/shared/theme/theme-provider';
import { Providers } from '@/app/providers';
import { AuthProvider } from '@/components/providers/session-provider';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlackConcert - Event Management',
  description: 'Your premier event management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <NextSSRPlugin 
              routerConfig={extractRouterConfig(ourFileRouter)} 
            />
            <AuthProvider>
                  {children}
                  <Toaster position="top-center" />
           
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
