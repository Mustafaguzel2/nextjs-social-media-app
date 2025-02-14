import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { BookmarkInfo, LikeInfo } from "@/lib/types";

export async function GET(
  req: Request,
  context: { params: Promise<{ postId: string }> | { postId: string } },
) {
  // Await context.params if it is a Promise
  const params =
    context.params instanceof Promise ? await context.params : context.params;
  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: loggedInUser.id, postId } },
    });

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark,
    };
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ postId: string }> | { postId: string } },
) {
  const params =
    context.params instanceof Promise ? await context.params : context.params;
  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.bookmark.upsert({
      where: {
        userId_postId: { userId: loggedInUser.id, postId },
      },
      create: { userId: loggedInUser.id, postId },
      update: {},
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ postId: string }> | { postId: string } },
) {
  const params =
    context.params instanceof Promise ? await context.params : context.params;
  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.bookmark.deleteMany({
      where: { userId: loggedInUser.id, postId },
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
