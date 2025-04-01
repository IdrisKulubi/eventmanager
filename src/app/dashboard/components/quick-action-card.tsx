'use client';

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  color 
}: QuickActionCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={href} className="block h-full hover:bg-muted/5 transition-colors">
        <CardHeader className="pb-2">
          <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
            <span className="h-6 w-6" dangerouslySetInnerHTML={{ __html: icon }} />
          </div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Link>
    </Card>
  );
} 