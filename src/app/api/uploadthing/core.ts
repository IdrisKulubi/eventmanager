import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  eventImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("Unauthorized");

      // Only allow admin and manager roles to upload
      if (session.user.role !== 'admin' && session.user.role !== 'manager') {
        throw new UploadThingError("Unauthorized: Insufficient permissions");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // Return the file URL and any additional metadata
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileKey: file.key
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
