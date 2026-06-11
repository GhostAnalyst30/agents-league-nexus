"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { DigitalSelfData, DashboardStats } from "@/types"

export default function DashboardHome() {
  const { data: session } = useSession()
  const [digitalSelf, setDigitalSelf] = useState<DigitalSelfData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [agentFeed, setAgentFeed] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
    async function loadData() {
      const [dsRes, goalsRes, roadmapsRes] = await Promise.all([
        fetch("/api/digital-self"),
        fetch("/api/goals"),
        fetch("/api/roadmaps"),
      ])
      const ds = await dsRes.json()
      const goals = await goalsRes.json()
      const roadmaps = await roadmapsRes.json()

      setDigitalSelf(ds)

      const totalMilestones = roadmaps.reduce((acc: number, r: { milestones: unknown[] }) => acc + (r.milestones?.length || 0), 0)
      const completedMilestones = roadmaps.reduce((acc: number, r: { milestones: Array<{ completed: boolean }> }) => acc + (r.milestones?.filter((m: { completed: boolean }) => m.completed).length || 0), 0)

      setStats({
        goalsCount: goals.length,
        skillsCount: 0,
        roadmapsCount: roadmaps.length,
        achievementsCount: 0,
        activeRoadmaps: roadmaps.filter((r: { status: string }) => r.status === "active").length,
        completedMilestones,
        totalMilestones,
      })

      setAgentFeed([
        "Goal Analysis Agent: Monitoring your progress",
        "Skill Gap Agent: Ready to analyze gaps",
        "Learning Path Agent: Roadmaps up to date",
        "Opportunity Matching Agent: Scanning for matches",
      ])
    }
    loadData()
  }, [mounted])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="animate-in">
        <div className="eyebrow mb-5">
          <span className="eyebrow-dot eyebrow-dot--purple" />
          Dashboard
        </div>
        <h1
          className="text-3xl md:text-4xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400, lineHeight: 1.15 }}
        >
          Welcome back, {session?.user?.name || "Explorer"}
        </h1>
        <p
          className="mt-3 text-base"
          style={{ color: "var(--text-secondary)", fontWeight: 300 }}
        >
          Here&apos;s your evolution overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-stagger>
        {[
          { label: "Active Goals", value: stats?.goalsCount || 0, accent: "var(--accent-primary)", icon: "◎" },
          { label: "Active Roadmaps", value: stats?.activeRoadmaps || 0, accent: "var(--accent-warm)", icon: "◆" },
          { label: "Milestones Done", value: `${stats?.completedMilestones || 0}/${stats?.totalMilestones || 0}`, accent: "var(--accent-secondary)", icon: "◈" },
          { label: "Achievements", value: stats?.achievementsCount || 0, accent: "var(--accent-emerald)", icon: "◇" },
        ].map((item, i) => (
          <div key={item.label} className="premium-card magnetic-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                style={{
                  background: `${item.accent}20`,
                  color: item.accent,
                  boxShadow: `0 0 18px ${item.accent}18`,
                }}
              >
                {item.icon}
              </div>
              <span
                className="text-[10px] uppercase tracking-[0.1em] font-bold"
                style={{ color: "var(--text-whisper)" }}
              >
                Stat
              </span>
            </div>
            <p
              className="text-3xl font-bold tracking-tight mb-1"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              {item.value}
            </p>
            <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--text-muted)" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Digital Self + Agent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Digital Self */}
        <div className="lg:col-span-3 premium-card premium-card-elevated">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Digital Self
              </h2>
              <p className="text-xs mt-1 font-medium tracking-wide" style={{ color: "var(--text-muted)" }}>
                Living Human Model
              </p>
            </div>
            <div className="pill" style={{ fontSize: "0.6rem" }}>
              <span className="pill-dot pill-dot--purple" style={{ width: "0.3rem", height: "0.3rem" }} />
              Live
            </div>
          </div>
          <div className="space-y-6">
            {[
              { label: "Knowledge", value: digitalSelf?.knowledgeScore || 0, accent: "var(--accent-primary)" },
              { label: "Career", value: digitalSelf?.careerScore || 0, accent: "var(--accent-warm)" },
              { label: "Opportunity", value: digitalSelf?.opportunityScore || 0, accent: "var(--accent-secondary)" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                  <span className="font-bold tabular-nums" style={{ color: item.accent }}>{item.value}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.value}%`, background: item.accent, color: item.accent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Activity */}
        <div className="lg:col-span-2 premium-card premium-card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Agent Activity
              </h2>
              <p className="text-xs mt-1 font-medium tracking-wide" style={{ color: "var(--text-muted)" }}>
                Reasoning pipeline
              </p>
            </div>
            <div
              className="w-2 h-2 rounded-full animate-pulse-soft"
              style={{ background: "var(--accent-emerald)", boxShadow: "0 0 8px var(--accent-emerald-soft)" }}
            />
          </div>
          <div className="space-y-3">
            {agentFeed.map((feed, i) => (
              <div
                key={i}
                className="flex items-start gap-3"
                style={{
                  animation: `fadeInUp 0.5s ${i * 100 + 200}ms var(--ease-out) forwards`,
                  opacity: 0,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ background: "var(--accent-warm)", boxShadow: "0 0 5px var(--accent-warm-soft)" }}
                />
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feed}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-stagger>
        {[
          { href: "/dashboard/nexus-ai", label: "Talk to Nexus AI", desc: "Chat with your reasoning agents", accent: "var(--accent-primary)", icon: "◆" },
          { href: "/dashboard/roadmap", label: "View Roadmaps", desc: "Track your learning progress", accent: "var(--accent-warm)", icon: "◈" },
          { href: "/dashboard/my-nexus", label: "My Nexus", desc: "See your Digital Self evolution", accent: "var(--accent-secondary)", icon: "◇" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="premium-card magnetic-card group no-underline"
          >
            <div
              className="w-11 h-11 rounded-xl mb-5 flex items-center justify-center text-lg transition-all duration-500"
              style={{
                background: `${item.accent}18`,
                color: item.accent,
                boxShadow: `0 0 18px ${item.accent}15`,
              }}
            >
              {item.icon}
            </div>
            <h3 className="font-semibold text-base mb-1.5" style={{ color: "var(--text-primary)" }}>
              {item.label}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
