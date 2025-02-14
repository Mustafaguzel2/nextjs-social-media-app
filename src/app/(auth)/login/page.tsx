import { Metadata } from "next";
import LoginForm from "./LoginForm";
import Link from "next/link";
import loginImage from "@/assets/login-image.jpg";
import Image from "next/image";
import GoogleSignInButton from "./GoogleSignInButton";

export const metadata: Metadata = {
  title: "Login",
  description: "Login Page",
};

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="h-fullmax-h-[64rem] flex w-full max-w-[80rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Log in to Sociify</h1>
          <div className="space-y-5">
            <GoogleSignInButton />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted"></div>
              <span>OR</span>
              <div className="h-px flex-1 bg-muted"></div>
            </div>
            <LoginForm />
            <Link href="/signup" className="block text-center hover:underline">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
        <Image
          src={loginImage}
          alt="login image"
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
