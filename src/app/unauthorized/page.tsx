import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Unauthorized Access',
  description: 'You do not have permission to access this resource',
};

export default function UnauthorizedPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 bg-yellow-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Unauthorized Access</h1>
        <p className="text-xl text-muted-foreground">
          You do not have permission to access this resource.
        </p>
        <p className="text-muted-foreground">
          Please contact an administrator if you believe this is an error.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-1">
            <ArrowLeftIcon className="h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 