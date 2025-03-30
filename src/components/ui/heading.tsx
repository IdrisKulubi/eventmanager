import { ReactNode } from "react";

interface HeadingProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function Heading({ title, description, actions }: HeadingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
} 