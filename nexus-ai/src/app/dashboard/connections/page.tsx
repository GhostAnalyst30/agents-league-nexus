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

const typeAccents: Record<string, string> = {
  event: "var(--accent-teal)",
  competition: "var(--accent-ember)",
  scholarship: "var(--accent-teal-light)",
  hackathon: "var(--accent-gold)",
  internship: "var(--accent-gold-light)",
  course: "var(--accent-teal)",
}

const typeGradients: Record<string, string> = {
  event: "linear-gradient(135deg, var(--accent-teal), var(--accent-teal-light))",
  competition: "linear-gradient(135deg, var(--accent-ember), #d87a5a)",
  scholarship: "linear-gradient(135deg, var(--accent-teal-light), #3aadad)",
  hackathon: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
  internship: "linear-gradient(135deg, var(--accent-gold-light), #ece4d9)",
  course: "linear-gradient(135deg, var(--accent-teal), #3aadad)",
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

  useEffect(() => {
    fetchOpportunities()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-lg" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-gold))" }} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>Connections</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Opportunities matched to your goals</p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-nexus btn-nexus-primary"
          >
            {showForm ? "Cancel" : "Add Opportunity"}
            <span className="btn-arrow-icon">{showForm ? "✕" : "+"}</span>
          </button>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full glass-surface" style={{ color: "var(--text-muted)" }}>
            Read-only
          </span>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={createOpportunity} className="bezel-card">
          <div className="bezel-card-inner space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none nexus-transition"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  required
                  onFocus={(e) => e.target.style.borderColor = "rgba(26, 122, 122, 0.3)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none nexus-transition"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                >
                  {Object.keys(typeAccents).map((t) => (
                    <option key={t} value={t} style={{ background: "var(--bg-deep)" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none nexus-transition resize-none h-20"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                onFocus={(e) => e.target.style.borderColor = "rgba(26, 122, 122, 0.3)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none nexus-transition"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                placeholder="https://..."
                onFocus={(e) => e.target.style.borderColor = "rgba(26, 122, 122, 0.3)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
              />
            </div>
            <button type="submit" className="btn-nexus btn-nexus-primary">
              Add Opportunity
              <span className="btn-arrow-icon">→</span>
            </button>
          </div>
        </form>
      )}

      {opportunities.length === 0 && !showForm && (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No opportunities yet</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Add opportunities or chat with Nexus AI to discover relevant ones</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp) => (
          <div key={opp.id} className="bezel-card">
            <div className="bezel-card-inner">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0c0b0a] text-[10px] font-bold"
                  style={{ background: typeGradients[opp.type] || "rgba(255,255,255,0.1)" }}
                >
                  {opp.type.slice(0, 2).toUpperCase()}
                </div>
                {opp.matchScore !== null && (
                  <span className="text-sm font-bold" style={{ color: "var(--accent-teal-light)" }}>{opp.matchScore}% match</span>
                )}
              </div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{opp.title}</h3>
              {opp.description && <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{opp.description}</p>}
              {opp.matchReason && (
                <div className="text-xs rounded-lg p-3 mb-3 leading-relaxed" style={{ background: "rgba(196, 160, 121, 0.06)", color: "var(--accent-gold-light)" }}>
                  {opp.matchReason}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>{opp.type}</span>
                {opp.url && (
                  <a href={opp.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs nexus-transition" style={{ color: "var(--accent-teal)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-teal-light)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--accent-teal)"}
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
