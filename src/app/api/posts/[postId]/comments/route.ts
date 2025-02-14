import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> | { postId: string } }
) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { postId } = params;

  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 5;
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: getCommentDataInclude(user.id),
      orderBy: {
        createdAt: "asc",
      },
      take: -pageSize - 1,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });
    const previousCursor = comments.length > pageSize ? comments[0].id : null;
    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> | { postId: string } }
) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { postId } = params;

  try {
    const data = await req.json();
    // Validate received data as needed

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId,
        userId: data.userId, // Ideally, this comes from your authenticated user's info
      },
    });
    
    return NextResponse.json({ comment });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
