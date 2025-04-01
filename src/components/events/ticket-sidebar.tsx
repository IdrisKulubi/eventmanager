"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TicketIcon, HeartIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface TicketSidebarProps {
  maxTickets?: number;
  price: number;
  onPurchase: (quantity: number) => void;
}

export function TicketSidebar({ maxTickets, price, onPurchase }: TicketSidebarProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta;
      if (maxTickets && newQuantity > maxTickets) return prev;
      if (newQuantity < 1) return prev;
      return newQuantity;
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sticky top-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Price per ticket</p>
              <p className="text-2xl font-bold text-white">${price}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-purple-500/20"
                onClick={() => setIsLiked(!isLiked)}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-white" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-purple-500/20"
              >
                <ShareIcon className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-lg p-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-500/20"
              onClick={() => handleQuantityChange(-1)}
            >
              -
            </Button>
            <span className="text-xl font-semibold text-white">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-500/20"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">${price * quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Fees</span>
              <span className="text-white">${(price * quantity * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
              <span className="text-white">Total</span>
              <span className="text-purple-400">
                ${(price * quantity * 1.1).toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full"
            onClick={() => setShowModal(true)}
          >
            <TicketIcon className="h-5 w-5 mr-2" />
            Get Tickets
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to purchase {quantity} ticket{quantity > 1 ? "s" : ""}?
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    onPurchase(quantity);
                    setShowModal(false);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 