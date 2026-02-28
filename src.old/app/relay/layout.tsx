"use client";

import React, { useState, useEffect } from "react";
import useUser from "@/lib/users/useUser";
import useOrganization from "@/lib/organizations/useOrganization";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Briefcase,
  Receipt,
  Settings,
  Menu,
  ChevronLeft,
  Building2,
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
import { OrganizationSwitcher } from "@/components/in-app/organization-switcher";

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
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
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
              className="ml-auto text-[10px] h-5 bg-indigo-100 text-indigo-700 font-semibold"
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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Logo/Brand */}
      <div className={cn("mb-8", isCollapsed ? "px-2" : "px-4")}>
        <Link href="/relay" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">Relay</h1>
              <p className="text-xs text-slate-500">Institution Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Organization Switcher */}
      <div className={cn("mb-6", isCollapsed ? "px-2" : "px-3")}>
        <OrganizationSwitcher isCollapsed={isCollapsed} />
      </div>

      {/* Main Navigation */}
      <nav
        className={cn("space-y-1 flex-1", isCollapsed ? "px-2" : "px-3")}
      >
        <NavItem href="/relay/consultants" icon={Search} isCollapsed={isCollapsed}>
          Find Consultants
        </NavItem>
        <NavItem href="/relay/engagements" icon={Briefcase} isCollapsed={isCollapsed}>
          My Engagements
        </NavItem>
        <NavItem href="/relay/invoices" icon={Receipt} isCollapsed={isCollapsed}>
          Invoices
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
          href="/relay/settings"
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

export default function RelayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { organization, isLoading: isOrgLoading } = useOrganization();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    if (!isUserLoading && !isOrgLoading && !user) {
      router.push("/sign-in?callbackUrl=/relay");
    }
    // Check if user has an organization
    if (!isUserLoading && !isOrgLoading && user && !organization) {
      router.push("/app/create-organization");
    }
  }, [isUserLoading, isOrgLoading, user, organization, router]);

  if (isUserLoading || isOrgLoading) {
    return <PageLoader />;
  }

  if (!user || !organization) {
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
            <div className="w-[180px]">
              <OrganizationSwitcher />
            </div>
            <div className="flex items-center gap-2">
              <Link href="/relay" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-slate-900">Relay</span>
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
