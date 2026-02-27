"use client";

import React, { useState, useEffect } from "react";
import useUser from "@/lib/users/useUser";
import { getConsultantProfile } from "@/lib/rebound/actions";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  FileText,
  Briefcase,
  DollarSign,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { InAppFooter } from "@/components/layout/in-app-footer";
import { UserDropdown } from "@/components/in-app/user-dropdown";
import { PageLoader } from "@/components/in-app/page-loader";

// Consultant status colors
const statusColors = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

function NavItem({
  href,
  icon: Icon,
  children,
  className,
  badge,
  isCollapsed,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  badge?: string | number;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const content = (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-teal-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-teal-50 hover:text-teal-700",
        isCollapsed && "justify-center px-2",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-transform duration-100",
          isActive ? "text-white" : "text-slate-500",
        )}
      />
      {!isCollapsed && (
        <>
          <span>{children}</span>
          {badge && (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] h-5 bg-teal-100 text-teal-700 font-semibold"
            >
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {children}
          {badge && ` (${badge})`}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function SidebarContent({
  className,
  isCollapsed,
}: {
  className?: string;
  isCollapsed?: boolean;
}) {
  const { user } = useUser();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getConsultantProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Logo/Brand */}
      <div className={cn("mb-8", isCollapsed ? "px-2" : "px-4")}>
        <Link href="/rebound" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">Rebound</h1>
              <p className="text-xs text-slate-500">Consultant Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Profile Status */}
      {!isCollapsed && !loading && profile && (
        <div className="mb-6 px-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Profile Status</p>
            <span
              className={cn(
                "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                statusColors[profile.status as keyof typeof statusColors],
              )}
            >
              {profile.status}
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav
        className={cn("space-y-1 flex-1", isCollapsed ? "px-2" : "px-3")}
      >
        <NavItem href="/rebound/profile" icon={User} isCollapsed={isCollapsed}>
          My Profile
        </NavItem>
        <NavItem href="/rebound/documents" icon={FileText} isCollapsed={isCollapsed}>
          Documents
        </NavItem>
        <NavItem href="/rebound/engagements" icon={Briefcase} isCollapsed={isCollapsed}>
          Engagements
        </NavItem>
        <NavItem href="/rebound/earnings" icon={DollarSign} isCollapsed={isCollapsed}>
          Earnings
        </NavItem>
      </nav>

      {/* Divider */}
      <div
        className={cn(
          "my-4 border-t border-slate-200",
          isCollapsed ? "mx-2" : "mx-4",
        )}
      />

      {/* Bottom Navigation */}
      <div className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
        <NavItem
          href="/rebound/settings"
          icon={Settings}
          isCollapsed={isCollapsed}
        >
          Settings
        </NavItem>
        <UserDropdown user={user || null} variant={isCollapsed ? "compact" : "full"} />
      </div>
    </div>
  );
}

export default function ReboundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      router.push("/sign-in?callbackUrl=/rebound");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            "hidden md:flex flex-col border-r border-slate-200 bg-white",
            isCollapsed ? "w-[80px]" : "w-72",
            "transition-all duration-300",
          )}
        >
          <div className="p-4 flex-1">
            <SidebarContent isCollapsed={isCollapsed} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mb-3 mx-auto hover:bg-slate-100 text-slate-500"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-100",
                isCollapsed && "rotate-180",
              )}
            />
            <span className="sr-only">
              {isCollapsed ? "Expand" : "Collapse"} Sidebar
            </span>
          </Button>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-200 bg-white z-30 px-4">
          <div className="flex items-center justify-between h-full">
            <Link href="/rebound" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-900">Rebound</span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-slate-100 text-slate-600"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 pt-16">
                <div className="p-4">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto md:pt-0 pt-16">
            <div className="p-6 max-w-6xl mx-auto w-full">{children}</div>
          </div>
          <InAppFooter />
        </div>
      </div>
    </TooltipProvider>
  );
}
