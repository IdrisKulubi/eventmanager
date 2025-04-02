'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
   UserCircle, LogOut, Settings, 
  Ticket, Calendar, LayoutDashboard, ChevronDown 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Session } from 'next-auth';

interface UserButtonProps {
  session: Session | null;
  className?: string;
}

export function UserButton({ session, className = '' }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const user = session?.user;
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  
  // If no user, render sign in buttons
  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="text-white hover:bg-white/10"
        >
          <Link href="/signin">
            Sign In
          </Link>
        </Button>
        
        <Button 
          size="sm" 
          asChild
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Link href="/signup">
            Sign Up
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-white/10 px-2 py-1.5"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user.image || ''} 
                alt={user.name || 'User avatar'} 
              />
              <AvatarFallback className="bg-purple-900 text-white">
                {user.name?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col items-start">
              <div className="text-sm font-medium text-white truncate max-w-[100px]">
                {user.name || 'User'}
              </div>
              <div className="text-xs text-purple-300 truncate max-w-[100px]">
                {user.email}
              </div>
            </div>
            
            <ChevronDown className="ml-1 h-4 w-4 text-purple-300" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border border-purple-900/30">
          <DropdownMenuLabel className="text-purple-200">My Account</DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-purple-900/30" />
          
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/account" className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4 text-purple-400" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/account/tickets" className="cursor-pointer">
                <Ticket className="mr-2 h-4 w-4 text-purple-400" />
                <span>My Tickets</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/account/events" className="cursor-pointer">
                <Calendar className="mr-2 h-4 w-4 text-purple-400" />
                <span>Upcoming Events</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/account/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-purple-400" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          {/* Admin or Manager section */}
          {(isAdmin || isManager) && (
            <>
              <DropdownMenuSeparator className="bg-purple-900/30" />
              
              <DropdownMenuLabel className="text-purple-200">
                {isAdmin ? 'Admin' : 'Manager'} Controls
              </DropdownMenuLabel>
              
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link 
                    href={isAdmin ? "/admin/dashboard" : "/manager/dashboard"} 
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4 text-purple-400" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    href={isAdmin ? "/admin/events" : "/manager/events"} 
                    className="cursor-pointer"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-purple-400" />
                    <span>Manage Events</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
          
          <DropdownMenuSeparator className="bg-purple-900/30" />
          
          <DropdownMenuItem asChild>
            <Link href="/signout" className="cursor-pointer text-rose-500 hover:text-rose-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 