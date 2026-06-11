"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSignOut = useCallback(() => signOut(), [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-deep)" }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-deep)" }}>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 flex flex-col transition-transform duration-500 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "rgba(12, 12, 20, 0.95)",
          backdropFilter: "blur(32px) saturate(150%)",
          WebkitBackdropFilter: "blur(32px) saturate(150%)",
          borderRight: "1px solid var(--border-ghost)",
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "var(--border-ghost)" }}>
          <Link href="/dashboard" className="flex items-center gap-3 no-underline">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, var(--accent-warm), #d97706)",
                color: "var(--bg-abyss)",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
              }}
            >
              N
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight block" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Nexus AI
              </span>
              <span className="text-[10px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--text-muted)" }}>
                Human Evolution OS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p
            className="text-[10px] uppercase tracking-[0.12em] font-semibold px-3 mb-3"
            style={{ color: "var(--text-whisper)" }}
          >
            Navigation
          </p>
          {navItems.map((item, i) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  background: isActive ? "var(--accent-primary-soft)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(129, 140, 248, 0.15)" : "transparent"}`,
                  boxShadow: isActive ? "inset 0 0 0 1px rgba(129, 140, 248, 0.1)" : "none",
                  animation: `fadeInUp 0.5s ${i * 60}ms var(--ease-out) forwards`,
                  opacity: 0,
                }}
              >
                <span
                  className="text-base"
                  style={{
                    opacity: isActive ? 1 : 0.5,
                    filter: isActive ? "none" : "grayscale(0.3)",
                    transition: "all 0.35s var(--ease-out)",
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ fontFamily: "var(--font-body)" }}>{item.label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent-primary)", boxShadow: "0 0 8px var(--accent-primary-glow)" }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t" style={{ borderColor: "var(--border-ghost)" }}>
          <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.015)" }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-warm))",
                color: "#fff",
                boxShadow: "0 0 12px var(--accent-primary-soft)",
              }}
            >
              {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {session.user?.name || "User"}
                </p>
                {session.user?.role === "admin" && (
                  <span
                    className="text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full font-bold shrink-0"
                    style={{ background: "rgba(245, 158, 11, 0.12)", color: "var(--accent-warm)" }}
                  >
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                {session.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all"
            style={{
              color: "var(--text-muted)",
              background: "transparent",
              border: "1px solid var(--border-ghost)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent-rose)"
              e.currentTarget.style.borderColor = "rgba(251, 113, 133, 0.2)"
              e.currentTarget.style.background = "rgba(251, 113, 133, 0.04)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)"
              e.currentTarget.style.borderColor = "var(--border-ghost)"
              e.currentTarget.style.background = "transparent"
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main id="main-content" className="flex-1 overflow-auto min-h-[100dvh]">
        <div className="max-w-6xl mx-auto" style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
          {children}
        </div>
      </main>
    </div>
  )
}
