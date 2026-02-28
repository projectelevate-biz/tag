"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function WebsiteHomepage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Create floating particles
    const createParticles = () => {
      const container = document.getElementById("particles");
      if (!container) return;

      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        container.appendChild(particle);
      }
    };

    createParticles();

    // Scroll reveal animation
    const handleScroll = () => {
      const elements = document.querySelectorAll(".scroll-reveal");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.classList.add("visible");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-bg opacity-50" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Particles */}
      <div id="particles" className="particles-container" />

      {/* Aurora Effects */}
      <div className="aurora" style={{ animationDelay: "0s" }} />
      <div className="aurora" style={{ animationDelay: "-10s", opacity: 0.5 }} />

      {/* Morphing Blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl morphing-blob" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl morphing-blob" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl morphing-blob" style={{ animationDelay: "-2s" }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        {/* Logo/Brand */}
        <div className={`mb-8 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-button mb-8 animate-float">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-white/90">Now Live — Higher Ed Consulting Network</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-4">
            <span className="gradient-text">Adaptive</span>
            <span className="text-white"> Group</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            The premier higher education consulting network connecting elite consultants with world-class institutions.
          </p>
        </div>

        {/* Stats Section */}
        <div className={`flex flex-wrap justify-center gap-8 mb-16 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {[
            { value: "500+", label: "Expert Consultants" },
            { value: "200+", label: "Institutions Served" },
            { value: "50M+", label: "Impact Value" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Portal Cards */}
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
          {/* Rebound Portal Card */}
          <Link
            href="/rebound/profile"
            className={`group relative flex-1 scroll-reveal transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative h-full glass-card rounded-3xl p-8 md:p-10 border border-white/20 hover:border-white/40 transition-all duration-500 group-hover:scale-105 overflow-hidden">
              {/* Spotlight Effect */}
              <div className="spotlight absolute inset-0 rounded-3xl" />

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl">
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundSize: "200% 200%", animation: "gradient-x 3s ease infinite" }} />
              </div>

              {/* Icon */}
              <div className="relative w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-float shadow-lg shadow-blue-500/50">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-4">Rebound</h2>
              <p className="relative text-white/70 mb-8 min-h-[60px]">
                For Consultants. Build your profile, manage engagements, showcase expertise, and grow your practice.
              </p>

              {/* Features List */}
              <ul className="relative space-y-3 mb-8 text-left">
                {[
                  "Professional Profile Builder",
                  "Engagement Management",
                  "Document Portfolio",
                  "Earnings Dashboard",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
                    <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity" />
                <button className="relative w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
                  Enter Rebound Portal
                  <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>

          {/* Relay Portal Card */}
          <Link
            href="/relay/consultants"
            className={`group relative flex-1 scroll-reveal transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative h-full glass-card rounded-3xl p-8 md:p-10 border border-white/20 hover:border-white/40 transition-all duration-500 group-hover:scale-105 overflow-hidden">
              {/* Spotlight Effect */}
              <div className="spotlight absolute inset-0 rounded-3xl" />

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl">
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundSize: "200% 200%", animation: "gradient-x 3s ease infinite" }} />
              </div>

              {/* Icon */}
              <div className="relative w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center animate-float-delayed shadow-lg shadow-violet-500/50">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-4">Relay</h2>
              <p className="relative text-white/70 mb-8 min-h-[60px]">
                For Institutions. Discover elite consultants, launch engagements, and manage projects seamlessly.
              </p>

              {/* Features List */}
              <ul className="relative space-y-3 mb-8 text-left">
                {[
                  "Search Expert Consultants",
                  "Engagement Management",
                  "Secure Payments",
                  "Real-time Messaging",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
                    <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity" />
                <button className="relative w-full bg-gradient-to-r from-violet-600 to-purple-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 group-hover:scale-105">
                  Enter Relay Portal
                  <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className={`mt-20 scroll-reveal transition-all duration-1000 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="text-white/40 text-sm mb-6">Trusted by leading institutions worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["Harvard", "Stanford", "MIT", "Yale", "Princeton", "Columbia"].map((name, i) => (
              <div key={i} className="text-white/40 font-semibold text-lg hover:text-white/80 transition-colors cursor-default">
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`mt-16 scroll-reveal transition-all duration-1000 delay-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="text-white/50 text-sm">
            Not sure which portal is right for you?{" "}
            <Link href="/about" className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4">
              Learn more about our platform
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
