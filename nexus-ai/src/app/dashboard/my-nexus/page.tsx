"use client"

import { useEffect, useState } from "react"
import type { DigitalSelfData } from "@/types"

const avatarConfig = {
  knowledge: { accent: "var(--accent-cosmos)", accentLight: "#a29bfe", label: "Knowledge Self", desc: "Learning & Skills", icon: "📚" },
  career: { accent: "var(--accent-aurum)", accentLight: "#e8c547", label: "Career Self", desc: "Projects & Growth", icon: "💼" },
  opportunity: { accent: "var(--accent-solar)", accentLight: "#f89a7e", label: "Opportunity Self", desc: "Networking & Events", icon: "⚡" },
}

const statEntries = [
  { key: "knowledgeScore", label: "Knowledge", accent: "var(--accent-cosmos)" },
  { key: "careerScore", label: "Career", accent: "var(--accent-aurum)" },
  { key: "opportunityScore", label: "Opportunity", accent: "var(--accent-solar)" },
  { key: "confidenceScore", label: "Confidence", accent: "var(--accent-emerald)" },
  { key: "consistencyScore", label: "Consistency", accent: "var(--accent-aurum-light, #e8c547)" },
  { key: "growthScore", label: "Growth", accent: "var(--accent-solar-light, #f89a7e)" },
] as const

export default function MyNexusPage() {
  const [digitalSelf, setDigitalSelf] = useState<DigitalSelfData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
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
  }, [mounted])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="spinner" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="spinner" />
      </div>
    )
  }

  const scores = statEntries.map((s) => ({
    ...s,
    value: Math.round(digitalSelf?.[s.key as keyof DigitalSelfData] as number || 0),
  }))

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fadeInUp">
          <div className="eyebrow mb-4">
            <span className="eyebrow-dot eyebrow-dot--cosmos" />
            Living Human Model
        </div>
        <h1
          className="text-3xl md:text-4xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
        >
          My Nexus
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
          Your Digital Self — evolving with every action
        </p>
      </div>

      {/* Avatar Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" data-stagger>
        {(Object.keys(avatarConfig) as Array<keyof typeof avatarConfig>).map((key) => {
          const cfg = avatarConfig[key]
          const score = key === "knowledge" ? digitalSelf?.knowledgeScore || 0
            : key === "career" ? digitalSelf?.careerScore || 0
            : digitalSelf?.opportunityScore || 0
          return (
            <div key={key} className="doppel-card magnetic-card">
              <div className="doppel-card-inner" style={{ textAlign: "center" }}>
                <div className="mx-auto mb-5" style={{
                  width: "7rem",
                  height: "7rem",
                  borderRadius: "9999px",
                  padding: "2px",
                  background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentLight})`,
                  boxShadow: `0 0 36px ${cfg.accent}25, 0 0 72px ${cfg.accent}12`,
                }}>
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: "var(--bg-deep)" }}
                  >
                    <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: cfg.accent }}>
                      {score}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl mb-2">{cfg.icon}</div>
                <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{cfg.label}</h3>
                <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{cfg.desc}</p>
                <div className="progress-bar mt-4">
                  <div className="progress-fill" style={{ width: `${score}%`, background: cfg.accent, color: cfg.accent }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" data-stagger>
        {scores.map((score) => (
          <div key={score.label} className="doppel-card magnetic-card">
            <div className="doppel-card-inner" style={{ textAlign: "center", padding: "1.25rem 1rem" }}>
              <p
                className="text-2xl font-bold mb-2 tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                {score.value}%
              </p>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{ width: `${score.value}%`, background: score.accent, color: score.accent }} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em] font-semibold" style={{ color: "var(--text-muted)" }}>
                {score.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Evolution Timeline */}
      <div className="doppel-card doppel-card-elevated">
        <div className="doppel-card-inner">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Evolution Timeline
              </h2>
              <p className="text-[11px] mt-1 tracking-wide font-medium" style={{ color: "var(--text-muted)" }}>
                From initial state to projected growth
              </p>
            </div>
            <div className="eyebrow" style={{ fontSize: "0.6rem" }}>
              <span className="eyebrow-dot eyebrow-dot--aurum" style={{ width: "0.3rem", height: "0.3rem" }} />
              Live
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute left-[19px] top-0 bottom-0 hidden sm:block"
              style={{ width: "1px", background: "linear-gradient(180deg, var(--border-subtle), var(--accent-aurum), var(--border-subtle))", opacity: 0.5 }}
            />
            <div className="space-y-6">
              {[
                { month: "Initial State", scores: { knowledge: 0, career: 0, opportunity: 0 }, active: false },
                { month: "Current State", scores: {
                  knowledge: digitalSelf?.knowledgeScore || 0,
                  career: digitalSelf?.careerScore || 0,
                  opportunity: digitalSelf?.opportunityScore || 0,
                }, active: true },
                { month: "Projected", scores: {
                  knowledge: Math.min(100, (digitalSelf?.knowledgeScore || 0) + 22),
                  career: Math.min(100, (digitalSelf?.careerScore || 0) + 18),
                  opportunity: Math.min(100, (digitalSelf?.opportunityScore || 0) + 28),
                }, active: false },
              ].map((entry, i) => (
                <div key={entry.month} className="relative pl-0 sm:pl-16">
                  {/* Timeline dot */}
                  <div
                    className="hidden sm:flex absolute left-0 top-4 w-[38px] h-[38px] rounded-full items-center justify-center"
                    style={{
                      background: entry.active ? "var(--accent-aurum)" : "var(--bg-surface)",
                      border: `2px solid ${entry.active ? "var(--accent-aurum)" : "var(--border-subtle)"}`,
                      boxShadow: entry.active ? "0 0 0 4px rgba(201, 162, 39, 0.12), 0 0 20px rgba(201, 162, 39, 0.15)" : "none",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: entry.active ? "#fff" : "var(--text-muted)" }}
                    />
                  </div>

                  <div
                    className="rounded-2xl p-5 sm:p-6 transition-all"
                    style={{
                      background: entry.active ? "var(--bg-elevated)" : "var(--bg-surface)",
                      border: `1px solid ${entry.active ? "var(--border-hover)" : "var(--border-ghost)"}`,
                      boxShadow: entry.active ? "0 4px 32px rgba(0,0,0,0.25)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{entry.month}</p>
                      {entry.active && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-[0.1em]"
                          style={{ background: "rgba(201, 162, 39, 0.1)", color: "var(--accent-aurum)" }}
                        >
                          Now
                        </span>
                      )}
                      {i === 2 && !entry.active && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-[0.1em]"
                          style={{ background: "rgba(108, 92, 231, 0.1)", color: "var(--accent-cosmos)" }}
                        >
                          Projection
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 sm:gap-8">
                      {[
                        { label: "Knowledge", value: entry.scores.knowledge, accent: "var(--accent-cosmos)" },
                        { label: "Career", value: entry.scores.career, accent: "var(--accent-aurum)" },
                        { label: "Opportunity", value: entry.scores.opportunity, accent: "var(--accent-solar)" },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className="text-[10px] uppercase tracking-[0.1em] mb-2 font-semibold" style={{ color: "var(--text-muted)" }}>
                            {s.label}
                          </p>
                          <div className="flex items-center gap-2.5">
                            <div className="progress-bar flex-1">
                              <div className="progress-fill" style={{ width: `${s.value}%`, background: s.accent, color: s.accent }} />
                            </div>
                            <span className="font-bold text-xs tabular-nums" style={{ color: "var(--text-primary)" }}>
                              {s.value}%
                            </span>
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
      <div className="doppel-card">
        <div className="doppel-card-inner">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Achievements
              </h2>
              <p className="text-[11px] mt-1 tracking-wide font-medium" style={{ color: "var(--text-muted)" }}>
                Milestones unlocked
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, var(--accent-aurum), #e8c547)",
                color: "var(--bg-abyss)",
              }}
            >
              4
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: "Nexus Explorer", desc: "Started your evolution", icon: "🌱", unlocked: true },
              { title: "Goal Setter", desc: "First goal created", icon: "🎯", unlocked: (digitalSelf?.knowledgeScore || 0) > 0 },
              { title: "Knowledge Seeker", desc: "Reach 25% knowledge", icon: "📚", unlocked: (digitalSelf?.knowledgeScore || 0) >= 25 },
              { title: "Career Builder", desc: "Reach 25% career", icon: "💼", unlocked: (digitalSelf?.careerScore || 0) >= 25 },
            ].map((ach) => (
              <div
                key={ach.title}
                className="rounded-2xl p-5 text-center doppel-card"
                style={{
                  background: ach.unlocked ? "var(--bg-elevated)" : "rgba(255,255,255,0.01)",
                  border: `1px solid ${ach.unlocked ? "var(--border-subtle)" : "var(--border-ghost)"}`,
                  opacity: ach.unlocked ? 1 : 0.35,
                  filter: ach.unlocked ? "none" : "grayscale(0.5)",
                  transition: "all 0.5s var(--ease-luxury)",
                }}
              >
                <div
                  className="text-3xl mb-3 transition-transform"
                  style={{
                    animation: ach.unlocked ? "floatYGentle 6s ease-in-out infinite" : "none",
                    filter: ach.unlocked ? "none" : "grayscale(0.6)",
                  }}
                >
                  {ach.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{ach.title}</h3>
                <p className="text-[10px] tracking-wide" style={{ color: "var(--text-muted)" }}>{ach.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
