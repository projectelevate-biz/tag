import { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${appConfig.projectName} account`,
};

export default function SignInPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back
        </h1>
        <p className="text-white/60">
          Sign in to your account to continue
        </p>
      </div>

      <AuthForm />

      <div className="mt-6 text-center">
        <Link
          href="/sign-up"
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </>
  );
}
