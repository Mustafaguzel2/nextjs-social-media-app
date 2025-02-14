import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Define the RouteContext interface with params as a Promise
interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

// GET request handler to fetch follower information
export async function GET(req: NextRequest, context: RouteContext) {
  // Always await the params Promise
  const { userId } = await context.params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId, // Use userId from context.params for correct routing
      },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}

// POST request handler to follow a user
export async function POST(req: NextRequest, context: RouteContext) {
  // Always await the params Promise
  const { userId } = await context.params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {}, // No update needed if the follow relationship already exists
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new NextResponse(
      JSON.stringify({ message: "Followed successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}

// DELETE request handler to unfollow a user
export async function DELETE(req: NextRequest, context: RouteContext) {
  // Always await the params Promise
  const { userId } = await context.params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
      });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new NextResponse(
      JSON.stringify({ message: "Unfollowed successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /follow:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
