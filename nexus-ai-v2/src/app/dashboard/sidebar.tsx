"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "◈" },
  { href: "/dashboard/chat", label: "Nexus AI", icon: "✦" },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: "⊡" },
  { href: "/dashboard/opportunities", label: "Opportunities", icon: "⊚" },
  { href: "/dashboard/nexus", label: "My Nexus", icon: "◇" },
];

export default function Sidebar({
  userName,
  userEmail,
  userRole,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-card border-r border-border flex flex-col z-40">
      <div className="p-6 border-b border-border">
        <a href="/" className="font-bold text-lg tracking-tight">
          Nexus <span className="text-accent">AI</span>
        </a>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-foreground hover:bg-card-hover"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted truncate">
              {userRole === "admin" ? "Admin" : userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full mt-2 px-4 py-2 text-xs text-muted hover:text-foreground hover:bg-card-hover rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
