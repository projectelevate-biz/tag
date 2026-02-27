import Link from "next/link";
import { appConfig } from "@/lib/config";

const FooterSection = () => {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <section className="mx-auto w-full p-8 md:p-12">
        <div className="mx-auto max-w-7xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">{appConfig.projectName}</span>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed">
                The premier higher education consulting network connecting elite consultants with world-class institutions.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/rebound/profile" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Rebound for Consultants
                  </Link>
                </li>
                <li>
                  <Link href="/relay/consultants" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Relay for Institutions
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/policies/privacy" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/terms" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/policies/cookie" className="text-white/50 hover:text-cyan-400 transition-colors text-sm">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <span>© {new Date().getFullYear()} {appConfig.projectName}</span>
                <span className="text-white/20">•</span>
                <span>All rights reserved</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {[
                  { name: "Twitter", href: "#", icon: "𝕏" },
                  { name: "LinkedIn", href: "#", icon: "in" },
                  { name: "GitHub", href: "#", icon: "gh" },
                ].map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
                    aria-label={social.name}
                  >
                    <span className="text-xs font-bold">{social.icon}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default FooterSection;
