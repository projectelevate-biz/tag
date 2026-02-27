"use client";

import { appConfig } from "@/lib/config";
import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Create floating particles for auth page
    const createParticles = () => {
      const container = document.getElementById("auth-particles");
      if (!container) return;

      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        container.appendChild(particle);
      }
    };

    createParticles();
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 animated-bg" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Particles */}
      <div id="auth-particles" className="particles-container" />

      {/* Aurora Effects */}
      <div className="aurora" style={{ animationDelay: "0s" }} />

      {/* Morphing Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl morphing-blob" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl morphing-blob" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl morphing-blob" style={{ animationDelay: "-2s" }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo/Brand */}
        <div className={`text-center mb-8 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-float">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            <span className="gradient-text">{appConfig.projectName}</span>
          </h1>
          <p className="text-white/60 text-lg">
            {appConfig.tagline || "The premier higher education consulting network"}
          </p>
        </div>

        {/* Auth Form Container */}
        <div className={`glass-card rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {children}
        </div>

        {/* Terms */}
        <p className="text-center text-sm text-white/40 mt-8">
          By continuing, you agree to our{" "}
          <Link
            href="/policies/terms"
            className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/policies/privacy"
            className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
