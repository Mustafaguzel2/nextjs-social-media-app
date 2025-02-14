'use server';

import { LoginValues, loginSchema } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect";
import prisma from "@/lib/prisma";
import { verify } from "argon2";
import { lucia } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";


export async function login(
    credentials: LoginValues,
): Promise<{ error: string }> {
    try {

        const { username, password } = loginSchema.parse(credentials);
        
        const existingUser = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive"
                }
            }
        });

        if (!existingUser || !existingUser.passwordHash) {
            return {
                error: "Incorrect username or password",
            };
        }

        const validPassword = await verify(existingUser.passwordHash, password);

        if (!validPassword) {
            return {
                error: "Incorrect username or password",
            };
        }

        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        // Çerez ayarlama
        const cookieStore = await cookies();
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );

        redirect("/");

    } catch (error) {
      if (isRedirectError(error)) {
        throw error; 
    }
    return {
        error: "Something went wrong, please try again.",
      };
    }
}