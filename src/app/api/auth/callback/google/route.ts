import { google, lucia } from "@/auth";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("state")?.value;
  const storedCodeVerifier = cookieStore.get("codeVerifier")?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    // Validate the Google authorization code.
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.accessToken()}` },
      })
      .json<{ id: string; name: string }>();

    // Look for an existing user.
    const existingUser = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (existingUser) {
      // If the user exists, create a session.
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return new Response(null, {
        status: 302,
        headers: { Location: "/" },
      });
    }

    // Generate new user details.
    const userId = generateIdFromEntropySize(10);
    const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

    // Create user and update external service inside a transaction.
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: googleUser.name,
          googleId: googleUser.id,
        },
      });

      await streamServerClient.upsertUser({
        id: userId,
        username,
        displayName: googleUser.name,
        name: username,
      });
    });

    // Now, create a session and set the session cookie.
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  } catch (error) {
    console.error("Error during Google auth callback:", error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(null, { status: 500 });
  }
}
