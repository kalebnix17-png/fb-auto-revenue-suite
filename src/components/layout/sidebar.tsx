"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Zap,
  Shield,
  ChevronDown,
} from "lucide-react";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import * as React from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/pages", label: "FB Pages", Icon: null, isFb: true },
  { href: "/dashboard/posts", label: "Posts", Icon: FileText },
  { href: "/dashboard/leads", label: "Leads / CRM", Icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/dashboard/ai", label: "AI Content", Icon: Zap },
  { href: "/dashboard/billing", label: "Billing", Icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <FacebookIcon className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm leading-tight">
            FB Auto Revenue<br />Suite
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-400 hover:text-white"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", collapsed ? "-rotate-90" : "rotate-90")}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map(({ href, Icon, label, isFb }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              {isFb
                ? <FacebookIcon className="h-5 w-5 shrink-0" />
                : Icon && <Icon className="h-5 w-5 shrink-0" />
              }
              {!collapsed && label}
            </Link>
          );
        })}

        {session?.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors",
              pathname.startsWith("/admin")
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <Shield className="h-5 w-5 shrink-0" />
            {!collapsed && "Admin"}
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-gray-700 p-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium shrink-0">
            {session?.user?.name ? getInitials(session.user.name) : "?"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
