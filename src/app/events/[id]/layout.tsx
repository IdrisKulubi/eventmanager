import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Details | EventManager',
  description: 'Browse and book tickets for this exciting event',
};

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {children}
    </div>
  );
} 