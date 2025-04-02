'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface TicketCategory {
  id: number;
  name: string;
  description: string | null;
  price: number | null  ;
  quantity: number;
  availableFrom: Date | null;
  availableTo: Date | null;
  isEarlyBird: boolean;
  isVIP: boolean;
  maxPerOrder: number;
}

interface TicketSectionProps {
  categories: TicketCategory[];
  eventId: number;
}

export function TicketSection({ categories, eventId }: TicketSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handlePurchase = async () => {
    if (!session) {
      toast.error("Please sign in to purchase tickets");
      return;
    }

    if (!selectedCategory) return;

    try {
      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          quantity,
          eventId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase tickets');
      }

      const data = await response.json();
      
      toast.success("Your tickets have been purchased successfully", {
        description: "Your tickets have been purchased successfully",
      });

      router.push(`/tickets/${data.orderId}`);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      toast.error("Failed to purchase tickets. Please try again.", {
        description: "Failed to purchase tickets. Please try again.",
      });
    }
  };

  return (
    <section className="py-16 bg-black/95">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-purple-100 mb-8 text-center">
          Available Tickets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`p-6 bg-purple-900/30 border-purple-800/50 hover:border-purple-500/50 transition-colors cursor-pointer ${
                selectedCategory?.id === category.id ? 'border-purple-500' : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-purple-100">
                    {category.name}
                  </h3>
                  {category.isEarlyBird && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Early Bird
                    </Badge>
                  )}
                  {category.isVIP && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      VIP
                    </Badge>
                  )}
                </div>

                <p className="text-purple-200">
                  {category.description || 'Standard ticket with full event access'}
                </p>

                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-100">
                    {category.price ? formatCurrency(category.price) : 'N/A'}
                  </p>
                  <p className="text-sm text-purple-300">
                    {category.quantity} tickets remaining
                  </p>
                </div>

                {selectedCategory?.id === category.id && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="text-purple-100">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(category.maxPerOrder, quantity + 1))}
                        disabled={quantity >= category.maxPerOrder}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={handlePurchase}
                    >
                      Purchase {quantity} {quantity === 1 ? 'Ticket' : 'Tickets'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 