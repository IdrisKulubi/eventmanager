'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { 
  CalendarDays, 
  Ticket, 
  MessageSquare, 
  MapPin,
  CreditCard,
  User
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon, title, description, index }: FeatureCardProps) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 delay-${index * 100} ${
        inView 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-16'
      }`}
    >
      <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/90 backdrop-blur-lg p-6 h-full border border-zinc-800 hover:border-purple-500/50 shadow-xl transition-all duration-300 hover:-translate-y-2 group">
        <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-purple-500/20 text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/30 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">{title}</h3>
        <p className="text-zinc-400 group-hover:text-zinc-300">{description}</p>
      </div>
    </div>
  );
};

const Features = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const features = [
    {
      icon: <CalendarDays className="w-6 h-6" />,
      title: 'Event Scheduling',
      description: 'Plan and schedule concerts with an intuitive calendar interface. Manage multiple venues and artists effortlessly.'
    },
    {
      icon: <Ticket className="w-6 h-6" />,
      title: 'Ticket Management',
      description: 'Sell tickets with customizable tiers, pricing, and seating charts. Track sales and attendance in real-time.'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Fan Communication',
      description: 'Stay connected with fans through personalized notifications, updates, and post-event feedback.'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Venue Mapping',
      description: 'Create detailed venue layouts with interactive seating charts and VIP zones for optimal event organization.'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Payment Processing',
      description: 'Secure and flexible payment options with real-time transaction tracking and automatic refund processing.'
    },
    {
      icon: <User className="w-6 h-6" />,
      title: 'Attendee Profiles',
      description: 'Build comprehensive attendee profiles with purchase history, preferences, and engagement metrics.'
    },
  ];

  return (
    <section className="py-20 md:py-28 relative z-10">
      <div 
        className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none"
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
            Supercharge Your Concert Experience
          </h2>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Our platform provides everything you need to create, manage, and experience 
            unforgettable live events with cutting-edge features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 