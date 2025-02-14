'use server'

import { lucia, validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function logout() {
    const {session} = await validateRequest();
    if(!session){
        throw new Error("Unauthorized");
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    const cookieStore = await cookies();
    cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );

    redirect("/login");
}