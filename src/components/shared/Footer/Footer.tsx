import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-zinc-900/50 backdrop-blur-lg border-t border-zinc-800 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                BlackConcert
              </span>
            </div>
            <p className="text-zinc-400 mb-6 max-w-md">
              Revolutionizing the concert experience with cutting-edge technology and unforgettable moments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faqs" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Developers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="text-zinc-400 hover:text-purple-400 transition-colors">
                  Licenses
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} BlackConcert. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <select className="bg-zinc-800 rounded-md border border-zinc-700 text-zinc-400 text-sm py-2 px-3 focus:ring-purple-500 focus:border-purple-500">
              <option>English (US)</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 