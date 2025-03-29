'use client';

import React from 'react';
import Link from "next/link";
import { CardContent, CardHeader } from "@/components/ui/card";
import GoogleSignInForm from "./google-signin-form";
import { 
  AnimatedFormField, 
  AnimatedLogo, 
  GlassmorphicCard,
  MusicNotes,
  TransitionLink
} from "../components";
import { motion } from 'framer-motion';

interface SignInClientWrapperProps {
  appName: string;
}

const SignInClientWrapper = ({ appName }: SignInClientWrapperProps) => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      {/* Floating music notes */}
      <MusicNotes />

      <GlassmorphicCard className="relative">
        <CardHeader className="space-y-6 pb-6 pt-8">
          <div className="flex justify-center">
            <Link href="/" className="relative group">
              <AnimatedLogo
                src="/assets/icons/logo.svg"
                alt={appName}
              />
            </Link>
          </div>

          <motion.div 
            className="space-y-2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome <span className="bg-gradient-to-r from-[#8A2BE2] to-purple-400 bg-clip-text text-transparent">Back</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-[250px] mx-auto">
              Sign in to access your tickets and exclusive concert experiences
            </p>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-8 pb-8 px-6">
          <AnimatedFormField delay={0.3}>
            <GoogleSignInForm />
          </AnimatedFormField>

          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-purple-500"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              <p className="text-sm font-medium bg-gradient-to-r from-purple-200 to-fuchsia-100 bg-clip-text text-transparent">
                Your VIP pass to live performances
              </p>
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
              />
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-zinc-400">
                Don&apos;t have an account?{" "}
                <TransitionLink
                  href="/sign-up"
                  className="font-medium text-purple-400 hover:text-purple-300"
                >
                  Sign up
                </TransitionLink>
              </p>
              <p className="text-xs text-zinc-500">
                By continuing, you agree to our{" "}
                <TransitionLink
                  href="/terms"
                  className="font-medium text-zinc-400"
                >
                  Terms & Privacy Policy
                </TransitionLink>
              </p>
            </div>
          </motion.div>
        </CardContent>

        {/* Equalizer bars at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 flex justify-center space-x-0.5 overflow-hidden opacity-70">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-[#8A2BE2] to-purple-300 rounded-t"
              initial={{ height: 0 }}
              animate={{ 
                height: [
                  `${Math.random() * 5 + 2}px`,
                  `${Math.random() * 15 + 5}px`,
                  `${Math.random() * 5 + 2}px`
                ] 
              }}
              transition={{
                duration: 0.8 + Math.random() * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.01
              }}
            />
          ))}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default SignInClientWrapper; 