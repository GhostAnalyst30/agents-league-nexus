"use client"

import { useState, useRef, useEffect } from "react"
import type { AgentMessage, AgentOutput } from "@/types"

const agentIcons: Record<string, string> = {
  "Goal Analysis": "🎯",
  "Skill Gap": "🔍",
  "Learning Path": "🗺️",
  "Opportunity Match": "⚡",
  "Profile Evolution": "📈",
  "Future Simulation": "🔮",
  default: "◈",
}

const agentColors: Record<string, string> = {
  "Goal Analysis": "var(--accent-cosmos)",
  "Skill Gap": "var(--accent-aurum)",
  "Learning Path": "var(--accent-emerald)",
  "Opportunity Match": "var(--accent-solar)",
  "Profile Evolution": "var(--accent-cosmos)",
  "Future Simulation": "var(--accent-aurum)",
  default: "var(--text-muted)",
}

export default function NexusAIChat() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: "assistant",
      content: "Hello, I'm Nexus AI. I'm your personal evolution guide. Share a goal, ask for advice, or tell me what you want to achieve — I'll analyze your situation and build a plan to grow.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [agentActivity, setAgentActivity] = useState<AgentOutput[]>([])
  const [completedAgents, setCompletedAgents] = useState<Set<number>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, agentActivity])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)
    setAgentActivity([])
    setCompletedAgents(new Set())

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10),
        }),
      })

      if (!res.ok) throw new Error("Failed to send message")

      const data = await res.json()

      if (data.agents && Array.isArray(data.agents)) {
        data.agents.forEach((agent: AgentOutput, idx: number) => {
          setTimeout(() => {
            setAgentActivity((prev) => [...prev, agent])
            setCompletedAgents((prev) => new Set(prev).add(idx))
          }, idx * 280)
        })
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ])
          setLoading(false)
        }, data.agents.length * 280 + 100)
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ])
        setLoading(false)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I encountered an error processing your message. Please try again." },
      ])
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-2rem)] flex gap-5">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col doppel-card doppel-card-elevated" style={{ minHeight: 0 }}>
        <div className="doppel-card-inner flex flex-col" style={{ height: "100%", padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center gap-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border-ghost)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent-aurum), #e8c547)",
                color: "var(--bg-abyss)",
                boxShadow: "0 0 12px var(--accent-aurum-soft)",
              }}
            >
              N
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Nexus AI</h2>
              <p className="text-[10px] tracking-wide font-medium" style={{ color: "var(--text-muted)" }}>
                Human Evolution Operating System
              </p>
            </div>
            {loading && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(108, 92, 231, 0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: "var(--accent-cosmos)" }} />
                <span className="text-[11px] font-semibold" style={{ color: "var(--accent-cosmos)" }}>
                  Agents thinking...
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animation: "fadeInUp 0.5s var(--ease-luxury) forwards" }}
              >
                <div
                  className={`max-w-[80%] px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "chat-bubble-user"
                      : "chat-bubble-assistant"
                  }`}
                  style={{ fontWeight: msg.role === "user" ? 500 : 300 }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 shrink-0" style={{ borderTop: "1px solid var(--border-ghost)" }}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Share a goal, ask for advice..."
                  className="input-field"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-primary"
                style={{ padding: "0.8rem 1.5rem" }}
              >
                Send
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Agent Activity Panel */}
      <div className="w-80 xl:w-96 hidden xl:flex flex-col doppel-card doppel-card-elevated shrink-0" style={{ minHeight: 0 }}>
        <div className="doppel-card-inner flex flex-col" style={{ height: "100%", padding: 0, overflow: "hidden" }}>
          {/* Panel Header */}
          <div className="px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-ghost)" }}>
            <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Agent Activity
            </h3>
            <p className="text-[10px] mt-1 tracking-wide font-medium" style={{ color: "var(--text-muted)" }}>
              Reasoning pipeline
            </p>
          </div>

          {/* Agent Progress List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {[
              "Goal Analysis",
              "Skill Gap",
              "Learning Path",
              "Opportunity Match",
              "Profile Evolution",
              "Future Simulation",
            ].map((name, i) => {
              const isCompleted = completedAgents.has(i)
              const agentData = agentActivity.find((a) => a.agentName === name)
              const isActive = loading && !isCompleted && !agentActivity.find((a) => a.agentName === name)
              const color = agentColors[name] || agentColors.default

              return (
                <div
                  key={name}
                  className="rounded-xl p-3.5 transition-all"
                  style={{
                    background: isCompleted ? "var(--bg-surface)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${isCompleted ? "var(--border-subtle)" : "var(--border-ghost)"}`,
                    animation: isActive ? `fadeInUp 0.4s ${i * 100}ms var(--ease-luxury) forwards` : "none",
                    opacity: isActive ? 0 : 1,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-sm">{agentIcons[name] || agentIcons.default}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {name} Agent
                    </span>
                    {isCompleted && (
                      <span
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(52, 211, 153, 0.1)", color: "var(--accent-emerald)" }}
                      >
                        Done
                      </span>
                    )}
                    {isActive && (
                      <span
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse-soft"
                        style={{ background: "rgba(108, 92, 231, 0.1)", color: "var(--accent-cosmos)" }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  {agentData ? (
                    <p className="text-[11px] leading-relaxed pl-7" style={{ color: "var(--text-secondary)" }}>
                      {agentData.findings}
                    </p>
                  ) : isActive ? (
                    <div className="pl-7 space-y-2">
                      <div className="h-2 rounded animate-shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "90%" }} />
                      <div className="h-2 rounded animate-shimmer" style={{ background: "rgba(255,255,255,0.03)", width: "65%" }} />
                    </div>
                  ) : (
                    <div className="pl-7">
                      <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.03)", width: "75%" }} />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="mt-2.5 pl-7">
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "100%",
                            background: color,
                            color: color,
                            boxShadow: `0 0 8px ${color}33`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
