"use server";
import * as argon2 from "argon2";
import { SignUpValues, signUpSchema } from "@/lib/validation";
import { hash } from "argon2";
import { generateIdFromEntropySize } from "lucia";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { lucia } from "@/auth"; // Lucia'yı import ettiğinizden emin olun
import streamServerClient from "@/lib/stream";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string } | void> {
  // return type void for successful sign-ups
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    // Kullanıcı adı kontrolü
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username already in use",
      };
    }

    // E-posta kontrolü
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already in use",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });
      await streamServerClient.upsertUsers([
        {
          id: userId,
          username,
          name: username,
        },
      ]);
    });

    // Oturum oluşturma
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Çerez ayarlama
    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Yönlendirme
    redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Signup Error: ", error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
