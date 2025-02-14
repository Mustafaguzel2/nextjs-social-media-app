import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({
    image: { maxFileSize: "1MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user?.avatarUrl;
      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];
        await new UTApi().deleteFiles(key);
      }
      // Replace the URL path segment so that Next.js's Image component can load the image
      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: { avatarUrl: newAvatarUrl },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);

      console.log("Upload complete for userId:", metadata.user.id);
      return { avatarUrl: newAvatarUrl };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });
      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
