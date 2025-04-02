'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Calendar, Clock, MapPin, Star, Users, Share2, Heart, ArrowLeft, Info, Ticket, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

// Sample event data - in a real app this would come from API/database
const eventData = {
  id: 'cosmic-soundscape',
  title: 'Cosmic Soundscape 2023',
  description: 'Experience the ultimate fusion of electronic music and visual art in this immersive concert featuring top international DJs and stunning light shows. The Cosmic Soundscape event transforms Nebula Arena into an otherworldly experience with state-of-the-art sound systems and mesmerizing visuals.',
  longDescription: `
    <p>The Cosmic Soundscape 2023 is set to be the most groundbreaking electronic music event of the year. Bringing together world-class DJs, cutting-edge visual artists, and advanced sound technology, this immersive experience will transport you to another dimension.</p>
    
    <p>Featuring a lineup of internationally acclaimed artists including Aurora Wave, Quantum Pulse, and The Nebula Collective, the event promises an unforgettable journey through various electronic music genres from ambient and downtempo to high-energy techno and trance.</p>
    
    <p>The venue will be transformed with spectacular 3D mapping projections, laser shows, and interactive light installations that respond to the music and crowd energy. Multiple stages will offer diverse experiences, from the main Cosmic Arena to the more intimate Stellar Lounge.</p>
    
    <p>Don't miss this unique opportunity to be part of a revolutionary music experience that pushes the boundaries of art, technology, and human connection.</p>
  `,
  date: 'December 15, 2023',
  time: '8:00 PM - 2:00 AM',
  location: 'Nebula Arena, Las Vegas',
  venue: {
    name: 'Nebula Arena',
    address: '1234 Cosmic Boulevard, Las Vegas, NV 89109',
    description: 'A state-of-the-art venue with advanced sound systems and visual capabilities.',
    capacity: 5000,
  },
  imageSrc: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1170&auto=format&fit=crop',
  gallery: [
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?q=80&w=1169&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520483691742-bada60a1edd6?q=80&w=1169&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1170&auto=format&fit=crop',
  ],
  price: 149,
  attendees: 2500,
  category: 'Electronic Music',
  artists: [
    { name: 'Aurora Wave', role: 'Main Act', image: 'https://images.unsplash.com/photo-1520155707862-5b32817388d6?q=80&w=1364&auto=format&fit=crop' },
    { name: 'Quantum Pulse', role: 'Support', image: 'https://images.unsplash.com/photo-1619229666372-3c26c399a633?q=80&w=1173&auto=format&fit=crop' },
    { name: 'The Nebula Collective', role: 'Opening', image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=1372&auto=format&fit=crop' },
  ],
  ticketTypes: [
    { id: 'general', name: 'General Admission', price: 149, available: 2000, description: 'Access to all main stages and common areas' },
    { id: 'vip', name: 'VIP Package', price: 299, available: 500, description: 'Premium viewing areas, fast-track entry, exclusive VIP lounge' },
    { id: 'platinum', name: 'Platinum Experience', price: 499, available: 100, description: 'All VIP benefits plus backstage tour, artist meet & greet, commemorative merchandise' },
  ],
};

export default function EventPage({ params }: { params: { id: string } }) {
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
  const totalAmount = eventData.ticketTypes.reduce(
    (sum, type) => sum + type.price * tickets[type.id], 
    0
  );

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <Image
          src={eventData.imageSrc}
          alt={eventData.title}
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
                {eventData.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {eventData.title}
              </h1>
              <p className="text-zinc-300 text-lg mb-6">
                {eventData.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">{eventData.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">{eventData.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">{eventData.venue.name}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-purple-400" />
                  <span className="text-zinc-200">{eventData.attendees}+ attending</span>
                </div>
              </div>
            </div>
            
            <div className="lg:border-l lg:border-purple-900/30 lg:pl-8 flex flex-col justify-center">
              <div className="text-center p-6 bg-gradient-to-br from-purple-900/20 to-zinc-900/60 rounded-lg border border-purple-900/20">
                <div className="text-sm text-zinc-400 mb-1">Starting from</div>
                <div className="text-3xl font-bold text-white mb-4">${eventData.price}</div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-0 mb-3"
                  onClick={() => setSelectedTab('tickets')}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Get Tickets
                </Button>
                
                <div className="text-xs text-zinc-400 mt-2">
                  {eventData.ticketTypes[0].available + eventData.ticketTypes[1].available + eventData.ticketTypes[2].available} tickets remaining
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
                value="lineup" 
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
              >
                Lineup
              </TabsTrigger>
              <TabsTrigger 
                value="venue" 
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
              >
                Venue
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
                    <div 
                      className="text-zinc-300 space-y-4 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: eventData.longDescription }}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Event Gallery</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {eventData.gallery.map((img, index) => (
                        <div 
                          key={index} 
                          className="relative h-40 rounded-lg overflow-hidden border border-purple-900/30 group"
                        >
                          <Image
                            src={img}
                            alt={`Event image ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="lineup" className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-6">Event Lineup</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {eventData.artists.map((artist, index) => (
                    <div 
                      key={index}
                      className="bg-zinc-800/50 border border-purple-900/20 rounded-xl overflow-hidden group"
                    >
                      <div className="relative h-56">
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent opacity-70" />
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-purple-800/80 text-white border-0">
                            {artist.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-xl font-semibold text-white mb-2">{artist.name}</h4>
                        <p className="text-zinc-400">Performance time TBA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="venue" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Venue Information</h3>
                    <p className="text-zinc-300 mb-4">{eventData.venue.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex">
                        <div className="w-32 text-zinc-400">Name:</div>
                        <div className="text-white">{eventData.venue.name}</div>
                      </div>
                      <div className="flex">
                        <div className="w-32 text-zinc-400">Address:</div>
                        <div className="text-white">{eventData.venue.address}</div>
                      </div>
                      <div className="flex">
                        <div className="w-32 text-zinc-400">Capacity:</div>
                        <div className="text-white">{eventData.venue.capacity} people</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
                      <MapPin className="w-4 h-4" />
                      <a href="#" className="text-sm font-medium">Get Directions</a>
                    </div>
                  </div>
                  
                  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden border border-purple-900/30">
                    {/* Placeholder for map - in a real app you would use Google Maps or similar */}
                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                        <p className="text-zinc-300">Interactive map would be displayed here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tickets" className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-6">Select Tickets</h3>
                
                <div className="space-y-4">
                  {eventData.ticketTypes.map((ticket) => (
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
                          const ticketType = eventData.ticketTypes.find(t => t.id === type);
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
                            You'll need to create an account or sign in to complete your purchase.
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