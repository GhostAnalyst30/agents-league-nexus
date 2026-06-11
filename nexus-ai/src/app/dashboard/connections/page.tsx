"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface Opportunity {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  matchScore: number | null
  matchReason: string | null
  createdAt: string
}

const typeConfig: Record<string, { accent: string; gradient: string; icon: string }> = {
  event: { accent: "var(--accent-cosmos)", gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)", icon: "◈" },
  competition: { accent: "var(--accent-solar)", gradient: "linear-gradient(135deg, #f0684a, #f89a7e)", icon: "◑" },
  scholarship: { accent: "var(--accent-emerald)", gradient: "linear-gradient(135deg, #34d399, #5eead4)", icon: "◇" },
  hackathon: { accent: "var(--accent-aurum)", gradient: "linear-gradient(135deg, #c9a227, #e8c547)", icon: "◆" },
  internship: { accent: "var(--accent-aurum-light, #e8c547)", gradient: "linear-gradient(135deg, #e8c547, #fef3c7)", icon: "◎" },
  course: { accent: "var(--accent-cosmos-light, #a29bfe)", gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)", icon: "▣" },
}

export default function ConnectionsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("event")
  const [url, setUrl] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
    fetchOpportunities()
  }, [mounted])

  async function fetchOpportunities() {
    try {
      const res = await fetch("/api/opportunities")
      if (res.ok) setOpportunities(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function createOpportunity(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, type, url }),
    })
    if (res.ok) {
      setTitle("")
      setDescription("")
      setUrl("")
      setShowForm(false)
      fetchOpportunities()
    }
  }

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

  const typeKeys = Object.keys(typeConfig)

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fadeInUp flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-4">
            <span className="eyebrow-dot eyebrow-dot--solar" />
            Connections
          </div>
          <h1
            className="text-3xl md:text-4xl tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
          >
            Opportunities
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
            Matched to your goals
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add Opportunity"}
            <span className="btn-arrow">{showForm ? "✕" : "+"}</span>
          </button>
        ) : (
          <span
            className="eyebrow"
            style={{ fontSize: "0.65rem", opacity: 0.7 }}
          >
            Read-only
          </span>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="doppel-card doppel-card-elevated">
          <div className="doppel-card-inner">
            <form onSubmit={createOpportunity} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-field"
                  >
                    {typeKeys.map((t) => (
                      <option key={t} value={t} style={{ background: "var(--bg-deep)" }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Opportunity
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {opportunities.length === 0 && !showForm && (
        <div className="text-center py-20">
          <div className="text-5xl mb-5 animate-float-slow">⚡</div>
          <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            No opportunities yet
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
            Add opportunities or chat with Nexus AI to discover relevant ones
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-stagger>
        {opportunities.map((opp) => {
          const config = typeConfig[opp.type] || typeConfig.event
          return (
            <div key={opp.id} className="doppel-card magnetic-card">
              <div className="doppel-card-inner">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: config.gradient,
                      color: "#fff",
                      boxShadow: `0 0 16px ${config.accent}30`,
                    }}
                  >
                    {config.icon}
                  </div>
                  {opp.matchScore !== null && (
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: "var(--accent-emerald)" }}
                    >
                      {opp.matchScore}%
                      <span className="text-[10px] font-medium ml-0.5" style={{ color: "var(--text-muted)" }}>match</span>
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-base mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                  {opp.title}
                </h3>
                {opp.description && (
                  <p className="text-sm mb-4 leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                    {opp.description}
                  </p>
                )}
                {opp.matchReason && (
                  <div
                    className="text-xs rounded-xl p-3.5 mb-4 leading-relaxed"
                    style={{
                      background: "rgba(201, 162, 39, 0.06)",
                      border: "1px solid rgba(201, 162, 39, 0.1)",
                      color: "var(--accent-aurum-light, #e8c547)",
                    }}
                  >
                    <span className="font-semibold mr-1">💡</span>
                    {opp.matchReason}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-ghost)" }}>
                  <span
                    className="text-[10px] uppercase tracking-[0.1em] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      color: config.accent,
                      border: `1px solid ${config.accent}25`,
                    }}
                  >
                    {opp.type}
                  </span>
                  {opp.url && (
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold transition-colors flex items-center gap-1"
                      style={{ color: "var(--accent-cosmos)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#a29bfe"
                        e.currentTarget.style.gap = "0.35rem"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--accent-cosmos)"
                        e.currentTarget.style.gap = "0.25rem"
                      }}
                    >
                      Learn more
                      <span>→</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
