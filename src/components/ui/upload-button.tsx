"use client";

import { UploadButton as UTUploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UploadButtonProps {
  onUploadComplete: (res: { fileUrl: string; fileKey: string }) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  buttonText?: string;
}

export function UploadButton({
  onUploadComplete,
  onUploadError,
  className,
  buttonText = "Upload Image",
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <UTUploadButton<OurFileRouter>
      endpoint="eventImageUploader"
      onUploadBegin={() => {
        setIsUploading(true);
      }}
      onClientUploadComplete={(res) => {
        setIsUploading(false);
        if (res?.[0]) {
          onUploadComplete({
            fileUrl: res[0].fileUrl,
            fileKey: res[0].fileKey,
          });
          toast.success("Image uploaded successfully");
        }
      }}
      onUploadError={(error: Error) => {
        setIsUploading(false);
        toast.error(`Upload failed: ${error.message}`);
        onUploadError?.(error);
      }}
      className={className}
    >
      {({ ready }) => (
        <Button
          type="button"
          disabled={!ready || isUploading}
          className={className}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      )}
    </UTUploadButton>
  );
} 