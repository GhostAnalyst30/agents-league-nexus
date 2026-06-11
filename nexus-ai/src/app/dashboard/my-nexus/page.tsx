"use client"

import { useEffect, useState } from "react"
import type { DigitalSelfData } from "@/types"

const avatarColors = {
  knowledge: { accent: "var(--accent-teal)", accentLight: "var(--accent-teal-light)", label: "Knowledge Self", desc: "Learning & Skills" },
  career: { accent: "var(--accent-gold)", accentLight: "var(--accent-gold-light)", label: "Career Self", desc: "Projects & Growth" },
  opportunity: { accent: "var(--accent-ember)", accentLight: "#d87a5a", label: "Opportunity Self", desc: "Networking & Events" },
}

export default function MyNexusPage() {
  const [digitalSelf, setDigitalSelf] = useState<DigitalSelfData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/digital-self")
        if (res.ok) setDigitalSelf(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-lg" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-gold))" }} />
      </div>
    )
  }

  const scores = [
    { label: "Knowledge", value: digitalSelf?.knowledgeScore || 0, accent: "var(--accent-teal)" },
    { label: "Career", value: digitalSelf?.careerScore || 0, accent: "var(--accent-gold)" },
    { label: "Opportunity", value: digitalSelf?.opportunityScore || 0, accent: "var(--accent-ember)" },
    { label: "Confidence", value: Math.round(digitalSelf?.confidenceScore || 0), accent: "var(--accent-teal-light)" },
    { label: "Consistency", value: Math.round(digitalSelf?.consistencyScore || 0), accent: "var(--accent-gold-light)" },
    { label: "Growth", value: Math.round(digitalSelf?.growthScore || 0), accent: "#d87a5a" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="animate-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-surface text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--text-muted)" }}>
          Living Human Model
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>My Nexus</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Your Digital Self — evolving with every action</p>
      </div>

      {/* Avatars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(["knowledge", "career", "opportunity"] as const).map((key) => {
          const avatar = avatarColors[key]
          const score = key === "knowledge" ? digitalSelf?.knowledgeScore || 0
            : key === "career" ? digitalSelf?.careerScore || 0
            : digitalSelf?.opportunityScore || 0
          return (
            <div key={key} className="bezel-card">
              <div className="bezel-card-inner" style={{ textAlign: "center" as const }}>
                <div className="ds-ring" style={{ width: "7rem", height: "7rem", margin: "0 auto 1.25rem" }}>
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: "var(--bg-deep)", borderRadius: "calc(9999px - 3px)" }}>
                    <span className="text-xl font-bold" style={{ color: avatar.accent }}>
                      {score}%
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{avatar.label}</h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{avatar.desc}</p>
                <div className="progress-bar mt-4">
                  <div className="progress-bar-fill" style={{ width: `${score}%`, background: avatar.accent }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {scores.map((score) => (
          <div key={score.label} className="bezel-card">
            <div className="bezel-card-inner" style={{ textAlign: "center" as const, padding: "1.25rem" }}>
              <div className="text-2xl font-bold mb-1 tracking-tight" style={{ color: "var(--text-primary)" }}>{score.value}%</div>
              <div className="progress-bar mb-2">
                <div className="progress-bar-fill" style={{ width: `${score.value}%`, background: score.accent }} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>{score.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bezel-card">
        <div className="bezel-card-inner">
          <h2 className="text-lg font-semibold mb-8" style={{ color: "var(--text-primary)" }}>Evolution Timeline</h2>
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="space-y-8">
              {[
                { month: "Initial State", scores: { knowledge: 0, career: 0, opportunity: 0 }, active: false },
                { month: "Current", scores: { knowledge: digitalSelf?.knowledgeScore || 0, career: digitalSelf?.careerScore || 0, opportunity: digitalSelf?.opportunityScore || 0 }, active: true },
                { month: "Next Goal", scores: {
                  knowledge: Math.min(100, (digitalSelf?.knowledgeScore || 0) + 20),
                  career: Math.min(100, (digitalSelf?.careerScore || 0) + 15),
                  opportunity: Math.min(100, (digitalSelf?.opportunityScore || 0) + 25),
                }, active: false },
              ].map((entry, i) => (
                <div key={i} className="relative pl-12">
                  <div
                    className="absolute left-[13px] top-1.5 w-3 h-3 rounded-full"
                    style={{
                      background: entry.active ? "var(--accent-gold)" : "rgba(255,255,255,0.06)",
                      border: `2px solid ${entry.active ? "var(--accent-gold)" : "var(--border-subtle)"}`,
                      boxShadow: entry.active ? "0 0 0 4px rgba(196, 160, 121, 0.15)" : "none",
                    }}
                  />
                  <div className="rounded-xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                    <p className="font-medium text-sm mb-4" style={{ color: "var(--text-primary)" }}>{entry.month}</p>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: "Knowledge", value: entry.scores.knowledge, accent: "var(--accent-teal)" },
                        { label: "Career", value: entry.scores.career, accent: "var(--accent-gold)" },
                        { label: "Opportunity", value: entry.scores.opportunity, accent: "var(--accent-ember)" },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className="text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar flex-1">
                              <div className="progress-bar-fill" style={{ width: `${s.value}%`, background: s.accent }} />
                            </div>
                            <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>{s.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bezel-card">
        <div className="bezel-card-inner">
          <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--text-primary)" }}>Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: "Nexus Explorer", desc: "Started your evolution", icon: "🌱", unlocked: true },
              { title: "Goal Setter", desc: "First goal created", icon: "🎯", unlocked: (digitalSelf?.knowledgeScore || 0) > 0 },
              { title: "Knowledge Seeker", desc: "Reach 25% knowledge", icon: "📚", unlocked: (digitalSelf?.knowledgeScore || 0) >= 25 },
              { title: "Career Builder", desc: "Reach 25% career", icon: "💼", unlocked: (digitalSelf?.careerScore || 0) >= 25 },
            ].map((ach) => (
              <div
                key={ach.title}
                className="rounded-xl p-4 text-center nexus-transition"
                style={{
                  background: ach.unlocked ? "var(--bg-surface)" : "rgba(255,255,255,0.01)",
                  border: `1px solid ${ach.unlocked ? "var(--border-subtle)" : "rgba(255,255,255,0.03)"}`,
                  opacity: ach.unlocked ? 1 : 0.4,
                }}
              >
                <div className="text-2xl mb-2">{ach.icon}</div>
                <h3 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{ach.title}</h3>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{ach.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
