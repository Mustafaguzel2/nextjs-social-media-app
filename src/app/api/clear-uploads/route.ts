import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 },
      );
    }
    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });
    new UTApi().deleteFiles(
      unusedMedia.map(
        (m) =>
          m.url.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1],
      ),
    );
    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });

    // Return a success response
    return NextResponse.json({ message: "Uploads cleared successfully" });
  } catch (error: any) {
    console.error("Error clearing uploads:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
