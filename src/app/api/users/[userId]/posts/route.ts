import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";

// Define the RouteContext interface with params as a Promise
interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Always await the params Promise to extract userId
    const { userId } = await context.params;

    // Get the cursor from the query params (for pagination)
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    // Validate the user
    const { user } = await validateRequest();

    // If the user is not authenticated, return unauthorized response
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Query the posts from Prisma
    const posts = await prisma.post.findMany({
      where: {
        userId, // Use the userId from params
      },
      include: getPostDataInclude(user.id),
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1, // Fetch one extra to determine if there is more data
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });

    // Determine if there is a next page (if posts.length > pageSize)
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Prepare the data to send back
    const data: PostsPage = {
      posts: posts.slice(0, pageSize), // Only take the first `pageSize` posts
      nextCursor,
    };

    // Return the posts data as JSON
    return new NextResponse(
      JSON.stringify(data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
