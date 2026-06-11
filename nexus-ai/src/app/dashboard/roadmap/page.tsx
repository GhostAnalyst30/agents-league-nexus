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
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
    fetchRoadmaps()
  }, [mounted])

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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fadeInUp flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div className="eyebrow mb-4">
            <span className="eyebrow-dot eyebrow-dot--aurum" />
            Roadmaps
          </div>
          <h1
            className="text-3xl md:text-4xl tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
          >
            Learning Journeys
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
            Your personalized learning journeys
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? "Cancel" : "New Roadmap"}
          <span className="btn-arrow">{showForm ? "✕" : "+"}</span>
        </button>
      </div>

      {showForm && (
        <div className="doppel-card doppel-card-elevated">
          <div className="doppel-card-inner">
            <form onSubmit={createRoadmap} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Learn Machine Learning"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="What do you want to achieve?"
                  rows={3}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Roadmap
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {roadmaps.length === 0 && !showForm && (
        <div className="text-center py-20">
          <div
            className="text-5xl mb-5 animate-float-slow"
          >🗺️</div>
          <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            No roadmaps yet
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
            Create a roadmap or chat with Nexus AI to generate one
          </p>
        </div>
      )}

      <div className="space-y-5" data-stagger>
        {roadmaps.map((roadmap) => {
          const completed = roadmap.milestones.filter((m) => m.completed).length
          const total = roadmap.milestones.length
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0
          const isActive = roadmap.status === "active"
          return (
            <div key={roadmap.id} className="doppel-card magnetic-card">
              <div className="doppel-card-inner">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                      {roadmap.title}
                    </h3>
                    {roadmap.description && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                        {roadmap.description}
                      </p>
                    )}
                    {roadmap.goal && (
                      <p className="text-xs mt-2 font-medium" style={{ color: "var(--accent-aurum)" }}>
                        Goal: {roadmap.goal.title}
                      </p>
                    )}
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] shrink-0 ml-4"
                    style={{
                      background: isActive ? "rgba(108, 92, 231, 0.1)" : "rgba(255,255,255,0.02)",
                      color: isActive ? "var(--accent-cosmos)" : "var(--text-muted)",
                      border: `1px solid ${isActive ? "rgba(108, 92, 231, 0.2)" : "var(--border-ghost)"}`,
                    }}
                  >
                    {roadmap.status}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2.5">
                    <span className="font-medium" style={{ color: "var(--text-muted)" }}>Progress</span>
                    <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {completed}/{total}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                        background: isActive ? "var(--accent-cosmos)" : "var(--text-muted)",
                        color: isActive ? "var(--accent-cosmos)" : "var(--text-muted)",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {roadmap.milestones.map((ms) => (
                    <div key={ms.id} className="flex items-center gap-3.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: ms.completed ? "var(--accent-cosmos)" : "transparent",
                          border: `2px solid ${ms.completed ? "var(--accent-cosmos)" : "var(--border-subtle)"}`,
                          boxShadow: ms.completed ? "0 0 10px var(--accent-cosmos-soft)" : "none",
                        }}
                      >
                        {ms.completed && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#fff" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-sm transition-all"
                        style={{
                          color: ms.completed ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: ms.completed ? "line-through" : "none",
                          fontWeight: ms.completed ? 300 : 400,
                        }}
                      >
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
