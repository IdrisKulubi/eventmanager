"use client";

import { UploadButton as UTUploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
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
    <UTUploadButton<OurFileRouter, "imageUploader">
      endpoint="imageUploader"
      onUploadBegin={() => {
        setIsUploading(true);
        console.log("Starting upload...");
      }}
      onClientUploadComplete={(res) => {
        setIsUploading(false);
        console.log("Upload completed on client side, result:", JSON.stringify(res, null, 2));
        if (res?.[0]) {
          onUploadComplete({
            fileUrl: res[0].ufsUrl,
            fileKey: res[0].key,
          });
          toast.success("Image uploaded successfully");
        }
      }}
      onUploadError={(error: Error) => {
        setIsUploading(false);
        console.error("Upload error:", error);
        toast.error(`Upload failed: ${error.message}`);
        onUploadError?.(error);
      }}
      className={className}
      content={{
        button: isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImageIcon className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        ),
      }}
    />
  );
} 