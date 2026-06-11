"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { DigitalSelfData, DashboardStats } from "@/types"

const accentColors: Record<string, string> = {
  teal: "var(--accent-teal)",
  tealLight: "var(--accent-teal-light)",
  gold: "var(--accent-gold)",
  goldLight: "var(--accent-gold-light)",
  ember: "var(--accent-ember)",
}

export default function DashboardHome() {
  const { data: session } = useSession()
  const [digitalSelf, setDigitalSelf] = useState<DigitalSelfData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [agentFeed, setAgentFeed] = useState<string[]>([])

  useEffect(() => {
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
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Welcome */}
      <div className="animate-in">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>
          Welcome back, {session?.user?.name || "Explorer"}
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Here&apos;s your evolution overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Goals", value: stats?.goalsCount || 0, accent: accentColors.teal },
          { label: "Active Roadmaps", value: stats?.activeRoadmaps || 0, accent: accentColors.gold },
          { label: "Milestones Done", value: `${stats?.completedMilestones || 0}/${stats?.totalMilestones || 0}`, accent: accentColors.ember },
          { label: "Achievements", value: stats?.achievementsCount || 0, accent: accentColors.tealLight },
        ].map((item, i) => (
          <div key={item.label} className="bezel-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="bezel-card-inner">
              <div className="w-8 h-8 rounded-lg mb-3" style={{ background: item.accent }} />
              <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{item.value}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Digital Self + Agent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bezel-card">
          <div className="bezel-card-inner">
            <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--text-primary)" }}>Digital Self</h2>
            <div className="space-y-5">
              {[
                { label: "Knowledge", value: digitalSelf?.knowledgeScore || 0, accent: accentColors.teal },
                { label: "Career", value: digitalSelf?.careerScore || 0, accent: accentColors.gold },
                { label: "Opportunity", value: digitalSelf?.opportunityScore || 0, accent: accentColors.ember },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{item.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${item.value}%`, background: item.accent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bezel-card">
          <div className="bezel-card-inner">
            <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--text-primary)" }}>Agent Activity</h2>
            <div className="space-y-4">
              {agentFeed.map((feed, i) => (
                <div key={i} className="flex items-start gap-3" style={{ animation: `fadeInUp 0.5s ${i * 100}ms var(--ease-out-expo) forwards`, opacity: 0 }}>
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: accentColors.gold }} />
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feed}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/nexus-ai", label: "Talk to Nexus AI", desc: "Chat with your reasoning agents", accent: accentColors.teal },
          { href: "/dashboard/roadmap", label: "View Roadmaps", desc: "Track your learning progress", accent: accentColors.gold },
          { href: "/dashboard/my-nexus", label: "My Nexus", desc: "See your Digital Self evolution", accent: accentColors.ember },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bezel-card group cursor-pointer">
            <div className="bezel-card-inner">
              <div className="w-10 h-10 rounded-xl mb-4 group-hover:scale-110 nexus-transition" style={{ background: item.accent }} />
              <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{item.label}</h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
