"use client";

import { motion } from "framer-motion";
import { CalendarIcon, MapPinIcon,  TagIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";

interface EventDetailsProps {
  startDate: string;
  endDate: string;
  venueName: string;
  categories: { id: number; name: string }[];
  ageRestriction?: number;
  maxTickets?: number;
  description: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function EventDetails({
  startDate,
  endDate,
  venueName,
  categories,
  ageRestriction,
  maxTickets,
  description
}: EventDetailsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div
        variants={item}
        className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <CalendarIcon className="h-6 w-6 text-purple-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">Date & Time</h3>
              <p className="text-gray-400">
                {new Date(startDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-400">
                {new Date(startDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(endDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPinIcon className="h-6 w-6 text-purple-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">Venue</h3>
              <p className="text-gray-400">{venueName}</p>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex items-start gap-4">
              <TagIcon className="h-6 w-6 text-purple-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white">Categories</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant="outline"
                      className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(ageRestriction || maxTickets) && (
            <div className="flex items-start gap-4">
              <UserGroupIcon className="h-6 w-6 text-purple-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white">Additional Info</h3>
                {ageRestriction && (
                  <p className="text-gray-400">
                    Age Restriction: {ageRestriction}+
                  </p>
                )}
                {maxTickets && (
                  <p className="text-gray-400">
                    Max Tickets per Person: {maxTickets}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-bold text-white mb-6">About This Event</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
} 