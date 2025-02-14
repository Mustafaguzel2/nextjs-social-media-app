import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { LikeInfo } from "@/lib/types";

export async function GET(
  req: Request,
  context: { params: { postId: string } },
) {
  const { postId } = await context.params;
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: { userId: loggedInUser.id },
          select: { userId: true },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { postId: string } },
) {
  const { postId } = await context.params; // ✅ params artık await edilmeli

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.like.create({
      data: {
        userId: loggedInUser.id,
        postId,
      },
    });

    return NextResponse.json({ message: "Post liked" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { postId: string } },
) {
  const { postId } = await context.params;
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.like.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId,
      },
    });

    return NextResponse.json({ message: "Like removed" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
