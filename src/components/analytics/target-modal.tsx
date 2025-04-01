'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TargetForm } from './target-form';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface TargetModalProps {
  year?: number;
  month?: number; // 0-11 (JavaScript month)
  currentTarget?: number;
  onSuccess?: () => void;
  variant?: 'icon' | 'button' | 'dropdown';
}

export function TargetModal({
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  currentTarget,
  onSuccess,
  variant = 'icon',
}: TargetModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle></DialogTitle>
      {variant === 'icon' && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Set target</span>
          </Button>
        </DialogTrigger>
      )}

      {variant === 'button' && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Set Target
          </Button>
        </DialogTrigger>
      )}

      {variant === 'dropdown' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setOpen(true)}>
              Set Target
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <TargetForm
          defaultYear={year}
          defaultMonth={month}
          defaultTarget={currentTarget}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 