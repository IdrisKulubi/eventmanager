'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export function DateRangePicker() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-zinc-900/70 border-purple-900/50 text-white hover:bg-purple-900/20 hover:text-purple-200",
              !date && "text-zinc-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-zinc-900 border-purple-900/50" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            className="rounded-md bg-zinc-900"
            classNames={{
              day_selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white",
              day_today: "bg-zinc-800 text-white",
              day_range_middle: "bg-purple-600/30 text-purple-200",
              day_range_end: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white",
              day_range_start: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white",
              day_outside: "text-zinc-600",
              caption: "text-white",
              caption_label: "text-white",
              nav_button: "text-zinc-400 hover:text-purple-300",
              table: "border-zinc-800",
              head_cell: "text-zinc-400",
              cell: "text-zinc-300",
              day: "text-zinc-300 hover:bg-zinc-800 hover:text-white",
            }}
          />
          {date?.from && date?.to && (
            <div className="p-3 border-t border-zinc-800">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDate(undefined)}
                className="w-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700"
              >
                Reset
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
} 