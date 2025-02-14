import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}

export async function POST(
  req: Request,
  context: { params: { userId: string } },
) {
  try {
    const { userId } = await context.params;
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
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
    // Use upsert to either create or update the follow relationship

    return new Response(JSON.stringify({ message: "Followed successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { userId: string } },
) {
  try {
    const { userId } = await context.params;
    // Validate request and retrieve the logged-in user
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Check if userId is provided
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
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
    // Delete the follow relationship if it exists

    // Respond with success message
    return new Response(
      JSON.stringify({ message: "Unfollowed successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in DELETE /follow:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
