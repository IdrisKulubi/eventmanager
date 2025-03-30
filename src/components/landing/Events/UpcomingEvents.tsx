'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  index: number;
}

const EventCard = ({ id, title, date, time, location, image, index }: EventCardProps) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 delay-${index * 150} ${
        inView 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-16'
      }`}
    >
      <Link 
        href={`/events/${id}`} 
        className="block h-full rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800/50 to-zinc-900/90 backdrop-blur-lg border border-zinc-800 hover:border-purple-500/50 shadow-xl transition-all duration-300 hover:-translate-y-2 group"
      >
        <div className="relative h-48 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 z-10"></div>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-20"></div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
            {title}
          </h3>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-zinc-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{date}</span>
            </div>
            
            <div className="flex items-center text-zinc-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center text-zinc-400">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{location}</span>
            </div>
          </div>
          
          <div className="mt-6 w-full">
            <button className="w-full py-2 rounded-md border border-purple-500 text-purple-400 hover:bg-purple-500/10 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

const UpcomingEvents = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const events = [
    {
      id: 'cosmic-harmony-2024',
      title: 'Cosmic Harmony 2024',
      date: 'June 15, 2024',
      time: '7:00 PM',
      location: 'Stellar Arena, New York',
      image: '/images/cosmic-harmony.jpg'
    },
    {
      id: 'neon-pulse-festival',
      title: 'Neon Pulse Festival',
      date: 'July 22, 2024',
      time: '6:30 PM',
      location: 'Electric Gardens, Miami',
      image: '/images/neon-pulse-festival.jpg'
    },
    {
      id: 'synthwave-nights',
      title: 'Synthwave Nights',
      date: 'August 10, 2024',
      time: '8:00 PM',
      location: 'Retro Stadium, Los Angeles',
      image: '/images/synthwave-nights.jpg'
    }
  ];

  return (
    <section className="py-20 md:py-28 relative z-10">
      <div 
        className="absolute inset-0 bg-gradient-to-b from-zinc-900/10 via-purple-900/5 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={ref} 
          className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Upcoming Events
          </h2>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Discover the hottest concerts and events coming soon. Secure your tickets
            today and experience music like never before.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              time={event.time}
              location={event.location}
              image={event.image}
              index={index}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/events"
            className="inline-flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents; 