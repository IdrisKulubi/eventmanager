'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Users, Share2, Heart, ArrowLeft, Info, Ticket, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

export default function EventPage() {
  const [selectedTab, setSelectedTab] = useState('details');
  const [tickets, setTickets] = useState<{ [key: string]: number }>({
    general: 0,
    vip: 0,
    platinum: 0,
  });

  const addTicket = (type: string) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.min(prev[type] + 1, 10), // Limit to 10 tickets per type
    }));
  };

  const removeTicket = (type: string) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.max(prev[type] - 1, 0),
    }));
  };

  const totalTickets = Object.values(tickets).reduce((sum, count) => sum + count, 0);
  const totalAmount = 149 * tickets.general + 299 * tickets.vip + 499 * tickets.platinum;
  
  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <Image
          src="/images/black-concert.jpg"
          alt="Black Concert"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        
        <div className="absolute top-4 left-4 z-10">
          <Link 
            href="/events" 
            className="inline-flex items-center text-zinc-300 hover:text-white transition-colors bg-zinc-900/50 backdrop-blur-sm px-3 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>

        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <Button variant="ghost" size="icon" className="bg-zinc-900/50 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-zinc-900/50 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="container mx-auto px-4 -mt-40 relative z-10">
        <div className="bg-zinc-900/70 backdrop-blur-md border border-purple-900/30 rounded-xl p-6 md:p-8 lg:p-10">
          {/* Event Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge className="mb-4 bg-purple-600 text-white hover:bg-purple-700 border-0">
                Concert
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Black Concert
              </h1>
              <p className="text-zinc-300 text-lg mb-6">
                Experience an unforgettable night of music with Black&apos;s greatest hits and special performances.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">December 15, 2024</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">8:00 PM - 2:00 AM</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">Nebula Arena</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">2500+ attending</span>
                </div>
              </div>
            </div>
            
            <div className="lg:border-l lg:border-purple-900/30 lg:pl-8 flex flex-col justify-center">
              <div className="text-center p-6 bg-gradient-to-br from-purple-900/20 to-zinc-900/60 rounded-lg border border-purple-900/20">
                <div className="text-sm text-zinc-400 mb-1">Starting from</div>
                <div className="text-3xl font-bold text-white mb-4">$149</div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-0 mb-3"
                  onClick={() => setSelectedTab('tickets')}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Get Tickets
                </Button>
                
                <div className="text-xs text-zinc-400 mt-2">
                  2600 tickets remaining
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-8 bg-purple-900/30" />
          
          {/* Tabs */}
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab} 
            className="w-full"
          >
            <TabsList className="bg-zinc-900 border border-purple-900/30 p-1">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
              >
                Event Details
              </TabsTrigger>
              <TabsTrigger 
                value="tickets" 
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
              >
                Tickets
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">About This Event</h3>
                    <div className="text-zinc-300 space-y-4 leading-relaxed">
                      <p>Join us for an extraordinary night of music featuring Black&apos;s greatest hits and special performances. This exclusive concert promises to be an unforgettable experience with state-of-the-art sound systems and mesmerizing visuals.</p>
                      <p>Don&apos;t miss this unique opportunity to witness one of the most anticipated concerts of the year.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tickets" className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-6">Select Tickets</h3>
                
                <div className="space-y-4">
                  {[
                    { id: 'general', name: 'General Admission', price: 149, available: 2000, description: 'Access to all main areas' },
                    { id: 'vip', name: 'VIP Package', price: 299, available: 500, description: 'Premium viewing areas and exclusive lounge access' },
                    { id: 'platinum', name: 'Platinum Experience', price: 499, available: 100, description: 'All VIP benefits plus backstage tour and meet & greet' },
                  ].map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="bg-zinc-800/40 border border-purple-900/20 rounded-lg p-4 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between md:justify-start md:space-x-3">
                          <h4 className="text-lg font-semibold text-white">{ticket.name}</h4>
                          <Badge className="bg-purple-900/60 text-purple-200 border-0">
                            {ticket.available} left
                          </Badge>
                        </div>
                        <p className="text-zinc-400 mt-1 mb-3 text-sm">{ticket.description}</p>
                        <div className="text-xl font-bold text-white">${ticket.price}</div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-purple-900/50 text-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                          onClick={() => removeTicket(ticket.id)}
                          disabled={tickets[ticket.id] === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="text-lg font-medium text-white w-6 text-center">
                          {tickets[ticket.id]}
                        </span>
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-purple-900/50 text-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                          onClick={() => addTicket(ticket.id)}
                          disabled={tickets[ticket.id] === 10 || tickets[ticket.id] >= ticket.available}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {totalTickets > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-purple-800/20 border border-purple-900/40 rounded-lg p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Order Summary</h4>
                        {Object.entries(tickets).map(([type, count]) => {
                          if (count === 0) return null;
                          const ticketType = [
                            { id: 'general', name: 'General Admission', price: 149 },
                            { id: 'vip', name: 'VIP Package', price: 299 },
                            { id: 'platinum', name: 'Platinum Experience', price: 499 },
                          ].find(t => t.id === type);
                          if (!ticketType) return null;
                          
                          return (
                            <div key={type} className="flex justify-between text-sm mb-2">
                              <span className="text-zinc-300">{ticketType.name} × {count}</span>
                              <span className="text-white">${ticketType.price * count}</span>
                            </div>
                          );
                        })}
                        
                        <Separator className="my-3 bg-purple-900/30" />
                        
                        <div className="flex justify-between font-semibold">
                          <span className="text-zinc-200">Total</span>
                          <span className="text-white">${totalAmount}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <div className="flex items-start mb-4">
                          <Info className="w-5 h-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-zinc-300">
                            You&apos;ll need to create an account or sign in to complete your purchase.
                          </p>
                        </div>
                        
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-0">
                          Proceed to Checkout
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </div>
  );
} 