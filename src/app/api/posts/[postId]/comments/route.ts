import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Burada context'in params özelliğini sadece Promise olarak tanımlıyoruz.
interface RouteContext {
  params: Promise<{
    postId: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  // Her zaman await et!
  const { postId } = await context.params;

  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 5;
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" },
      take: -pageSize - 1,
      cursor: cursor
        ? { id: cursor }
        : undefined,
    });

    const previousCursor = comments.length > pageSize ? comments[0].id : null;
    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { postId } = await context.params;

  try {
    const data = await req.json();
    // Gelen veriyi ihtiyaç duyduğun şekilde validate et

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId,
        userId: data.userId, // Bu ideally authenticated user's info'dan gelmeli
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
