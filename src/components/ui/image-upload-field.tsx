"use client";

import { UploadButton } from "@/components/ui/upload-button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  error?: string;
}

export function ImageUploadField({
  value,
  onChange,
  className,
  label,
  error,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleUploadComplete = (res: { fileUrl: string; fileKey: string }) => {
    onChange(res.fileUrl);
    setPreview(res.fileUrl);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <UploadButton
          onUploadComplete={handleUploadComplete}
          buttonText={preview ? "Change Image" : "Upload Image"}
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 