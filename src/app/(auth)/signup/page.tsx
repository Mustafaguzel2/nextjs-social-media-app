import { Metadata } from "next";
import signUpImage from "@/assets/signup-image.jpg";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign Up Page",
};

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[80rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="md:w-1/2 w-full space-y-10 overflow-y-auto p-10">
            <div className="space-y-1 text-center">
                <h1 className="text-3xl font-bold">
                    Sign Up to Sociify
                </h1>
                <p className="text-muted-foreground">
                    A place where even <span className="italic">you </span>
                can find friend.
                </p>
                <div className="space-y-5">
                    <SignUpForm />
                    <Link href="/login" className="block text-center hover:underline">
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
        </div>
      <Image 
        src={signUpImage} 
        alt="sign up image" 
        className="w-1/2 hidden object-cover md:block "/>
      </div>
    </main>
  );
}
