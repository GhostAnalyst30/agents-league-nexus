"use client"

import { useEffect, useState } from "react"

interface Milestone {
  id: string
  title: string
  completed: boolean
  order: number
}

interface Roadmap {
  id: string
  title: string
  description: string | null
  status: string
  goal?: { title: string } | null
  milestones: Milestone[]
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  async function fetchRoadmaps() {
    try {
      const res = await fetch("/api/roadmaps")
      if (res.ok) setRoadmaps(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function createRoadmap(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/roadmaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        milestones: [
          { title: "Research & Planning", order: 1 },
          { title: "Core Learning", order: 2 },
          { title: "Practice & Projects", order: 3 },
          { title: "Review & Mastery", order: 4 },
        ],
      }),
    })
    if (res.ok) {
      setTitle("")
      setDescription("")
      setShowForm(false)
      fetchRoadmaps()
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
          <h1 className="text-3xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>Roadmaps</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Your personalized learning journeys</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-nexus btn-nexus-primary"
        >
          {showForm ? "Cancel" : "New Roadmap"}
          <span className="btn-arrow-icon">{showForm ? "✕" : "+"}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={createRoadmap} className="bezel-card">
          <div className="bezel-card-inner space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none nexus-transition"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                placeholder="e.g., Learn Machine Learning"
                required
                onFocus={(e) => e.target.style.borderColor = "rgba(26, 122, 122, 0.3)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none nexus-transition resize-none h-20"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                placeholder="What do you want to achieve?"
                onFocus={(e) => e.target.style.borderColor = "rgba(26, 122, 122, 0.3)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
              />
            </div>
            <button type="submit" className="btn-nexus btn-nexus-primary">
              Create Roadmap
              <span className="btn-arrow-icon">→</span>
            </button>
          </div>
        </form>
      )}

      {roadmaps.length === 0 && !showForm && (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No roadmaps yet</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create a roadmap or chat with Nexus AI to generate one</p>
        </div>
      )}

      <div className="space-y-5">
        {roadmaps.map((roadmap) => {
          const completed = roadmap.milestones.filter((m) => m.completed).length
          const total = roadmap.milestones.length
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0
          return (
            <div key={roadmap.id} className="bezel-card">
              <div className="bezel-card-inner">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{roadmap.title}</h3>
                    {roadmap.description && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{roadmap.description}</p>}
                    {roadmap.goal && <p className="text-xs mt-2" style={{ color: "var(--accent-gold)" }}>Goal: {roadmap.goal.title}</p>}
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.1em]"
                    style={{
                      background: roadmap.status === "active" ? "rgba(26, 122, 122, 0.1)" : "rgba(255,255,255,0.03)",
                      color: roadmap.status === "active" ? "var(--accent-teal-light)" : "var(--text-muted)",
                      border: `1px solid ${roadmap.status === "active" ? "rgba(26, 122, 122, 0.2)" : "var(--border-subtle)"}`,
                    }}
                  >
                    {roadmap.status}
                  </span>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: "var(--text-muted)" }}>Progress</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{completed}/{total}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {roadmap.milestones.map((ms) => (
                    <div key={ms.id} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 nexus-transition"
                        style={{
                          background: ms.completed ? "var(--accent-teal)" : "rgba(255,255,255,0.04)",
                          border: `2px solid ${ms.completed ? "var(--accent-teal)" : "var(--border-subtle)"}`,
                        }}
                      >
                        {ms.completed && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--text-primary)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${ms.completed ? "line-through" : ""}`} style={{ color: ms.completed ? "var(--text-muted)" : "var(--text-primary)" }}>
                        {ms.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
