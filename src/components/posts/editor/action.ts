"use server";
import { validateRequest } from "@/auth";
import { createPostSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function submitPost(input: { content: string, mediaIds: string[] }) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { content, mediaIds } = createPostSchema.parse(input);

    const newPost = await prisma.post.create({
      data: {
        content,
        userId: user.id,
        attachments: {
          connect: mediaIds.map((mediaId) => ({ id: mediaId })),
        }
      },
      include: getPostDataInclude(user.id),
    });

    return newPost;
    
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}
