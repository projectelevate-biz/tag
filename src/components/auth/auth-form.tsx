"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FaGoogle, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { appConfig } from "@/lib/config";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  callbackUrl?: string;
}

/**
 * Authentication form component
 * Uses Supabase Auth instead of NextAuth
 * Supports Google OAuth and email/password authentication
 */
export function AuthForm({ className, callbackUrl, ...props }: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [isSignUp, setIsSignUp] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const showPasswordAuth = appConfig.auth?.enablePasswordAuth;

  const redirectUrl = callbackUrl || searchParams?.get("callbackUrl") || "/rebound/profile";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to continue with Google");
      }
      // OAuth will redirect automatically
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to continue with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent, isSignUpMode: boolean) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUpMode) {
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectUrl)}`,
          },
        });

        if (error) {
          toast.error(error.message || "Failed to sign up");
        } else {
          toast.success("Check your email for the confirmation link!");
          setEmail("");
          setPassword("");
        }
      } else {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message || "Invalid email or password");
        } else {
          router.push(redirectUrl);
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Google Sign In */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
        className="group relative w-full overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <div className="relative flex items-center justify-center gap-3">
          {isLoading ? (
            <FaSpinner className="h-5 w-5 animate-spin text-white" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="text-white font-medium">Continue with Google</span>
        </div>
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-3 text-white/40">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={(e) => handleEmailPasswordAuth(e, isSignUp)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-white/80 text-sm font-medium">Email address</Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-4 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300 rounded-xl"
          />
        </div>

        {showPasswordAuth && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-white/80 text-sm font-medium">Password</Label>
            <Input
              id="password"
              placeholder={isSignUp ? "Create a password" : "Enter your password"}
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-4 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300 rounded-xl"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-4 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative flex items-center justify-center gap-2">
            {isLoading && <FaSpinner className="h-4 w-4 animate-spin" />}
            {isSignUp ? "Sign Up" : "Sign In"}{isSignUp ? " with Email" : ""}
          </span>
        </Button>
      </form>

      {/* Toggle Sign In/Sign Up */}
      <div className="text-center text-sm">
        <span className="text-white/50">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
        </span>
        <button
          type="button"
          onClick={toggleMode}
          disabled={isLoading}
          className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4 ml-1 disabled:opacity-50"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
