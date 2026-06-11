"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const navItems = [
  { label: "Home", href: "/dashboard", icon: "◈" },
  { label: "Nexus AI", href: "/dashboard/nexus-ai", icon: "◆" },
  { label: "Roadmap", href: "/dashboard/roadmap", icon: "◈" },
  { label: "Connections", href: "/dashboard/connections", icon: "◇" },
  { label: "My Nexus", href: "/dashboard/my-nexus", icon: "○" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-deep)" }}>
        <div className="w-8 h-8 rounded-lg" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-gold))" }} />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-deep)" }}>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass-surface flex items-center justify-center text-white nexus-transition"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col nexus-transition ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "rgba(12, 11, 10, 0.92)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="p-6 border-b border-[rgba(255,255,255,0.04)]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0c0b0a] font-bold text-sm" style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
              N
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>Nexus AI</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium nexus-transition ${
                  isActive
                    ? "text-[#dcc5a8]" 
                    : "hover:text-[#ece4d9]"
                }`}
                style={{
                  color: isActive ? "var(--accent-gold-light)" : "var(--text-muted)",
                  background: isActive ? "rgba(196, 160, 121, 0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(196, 160, 121, 0.15)" : "transparent"}`,
                }}
              >
                <span className="opacity-50">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-3 mb-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#0c0b0a] text-xs font-bold" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-gold))" }}>
              {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {session.user?.name || "User"}
                </p>
                {session.user?.role === "admin" && (
                  <span className="text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(196, 160, 121, 0.12)", color: "var(--accent-gold-light)" }}>
                    Admin
                  </span>
                )}
                {session.user?.role === "demo" && (
                  <span className="text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(26, 122, 122, 0.12)", color: "var(--accent-teal-light)" }}>
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{session.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 text-sm nexus-transition rounded-xl hover:bg-[rgba(255,255,255,0.03)]"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <main id="main-content" className="flex-1 p-6 lg:p-10 pt-24 lg:pt-10 overflow-auto min-h-[100dvh]">
        {children}
      </main>
    </div>
  )
}
