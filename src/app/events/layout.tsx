import { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/shared/theme/theme-toggle";
import { UserButton } from "@/components/auth/user-button";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Events | EventManager",
  description: "Browse and discover upcoming concerts and events",
};

interface EventsLayoutProps {
  children: ReactNode;
}

export default async function EventsLayout({ children }: EventsLayoutProps) {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-purple-950 text-white">
      {/* Animated gradient background */}
      <div
        className="fixed inset-0 z-0 bg-[url('/images/grid.svg')] bg-center opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Header with navigation */}
      <header className="relative z-10 backdrop-blur-md border-b border-purple-900/30">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              EventManager
            </Link>
            
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <Link href="/events" className="text-white hover:text-purple-300 transition-colors py-2 border-b-2 border-purple-500">
                All Events
              </Link>
              <Link href="/events/categories" className="text-zinc-400 hover:text-purple-300 transition-colors py-2">
                Categories
              </Link>
              <Link href="/events/venues" className="text-zinc-400 hover:text-purple-300 transition-colors py-2">
                Venues
              </Link>
              <Link href="/events/artists" className="text-zinc-400 hover:text-purple-300 transition-colors py-2">
                Artists
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <ModeToggle />
            
            {session?.user ? (
              <UserButton session={session} />
            ) : (
              <>
                <Link 
                  href="/signin" 
                  className="hidden md:inline-flex items-center px-4 py-2 rounded-full border border-purple-500 text-purple-400 hover:bg-purple-500/10 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-900/30 py-10 mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                EventManager
              </h3>
              <p className="text-zinc-400 text-sm">
                The future of concert ticketing and event management.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events" className="text-zinc-400 hover:text-purple-300 transition-colors">All Events</Link></li>
                <li><Link href="/events/categories" className="text-zinc-400 hover:text-purple-300 transition-colors">Categories</Link></li>
                <li><Link href="/events/venues" className="text-zinc-400 hover:text-purple-300 transition-colors">Venues</Link></li>
                <li><Link href="/events/artists" className="text-zinc-400 hover:text-purple-300 transition-colors">Artists</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-zinc-400 hover:text-purple-300 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="text-zinc-400 hover:text-purple-300 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="text-zinc-400 hover:text-purple-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-400 hover:text-purple-300 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-zinc-400 hover:text-purple-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"/>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-purple-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-purple-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-purple-900/30 text-center text-zinc-500 text-sm">
            <p>&copy; {new Date().getFullYear()} EventManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 