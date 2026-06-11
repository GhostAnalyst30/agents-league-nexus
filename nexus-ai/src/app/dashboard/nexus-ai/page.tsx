"use client"

import { useState, useRef, useEffect } from "react"
import type { AgentMessage, AgentOutput } from "@/types"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)
    setAgentActivity([])

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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])

      if (data.agents) setAgentActivity(data.agents)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I encountered an error processing your message. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100dvh-8rem)] flex gap-5">
      {/* Chat */}
      <div className="flex-1 flex flex-col bezel-card overflow-hidden">
        <div className="bezel-card-inner" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.04)] flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0c0b0a] font-bold text-sm" style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
              N
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Nexus AI</h2>
              <p className="text-[10px] tracking-wide" style={{ color: "var(--text-muted)" }}>Human Evolution Operating System</p>
            </div>
            {loading && (
              <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: "var(--accent-teal)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-teal)" }} />
                Agents thinking...
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animation: "fadeInUp 0.4s var(--ease-out-expo) forwards" }}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "text-[#ece4d9]"
                      : ""
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: "var(--accent-teal)" }
                      : { background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[rgba(255,255,255,0.04)] flex-shrink-0">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Share a goal, ask for advice..."
                  className="w-full px-5 py-3 rounded-xl text-sm outline-none nexus-transition"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = "rgba(26, 122, 122, 0.3)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-nexus btn-nexus-primary px-5"
                style={{ padding: "0.75rem 1.5rem" }}
              >
                Send
                <span className="btn-arrow-icon">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Agent Activity */}
      <div className="w-72 hidden xl:flex flex-col bezel-card overflow-hidden flex-shrink-0">
        <div className="bezel-card-inner" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, overflow: "hidden" }}>
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.04)]">
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Agent Activity</h3>
            <p className="text-[10px] mt-0.5 tracking-wide" style={{ color: "var(--text-muted)" }}>Reasoning pipeline</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {agentActivity.length === 0 && !loading && (
              <p className="text-xs text-center mt-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Agent outputs appear here when you send a message
              </p>
            )}
            {loading && agentActivity.length === 0 && (
              <div className="space-y-3">
                {["Goal Analysis", "Skill Gap", "Learning Path", "Opportunity Match", "Profile Evolution", "Future Simulation"].map(
                  (name, i) => (
                    <div key={name} style={{ animation: `fadeInUp 0.4s ${i * 120}ms var(--ease-out-expo) forwards`, opacity: 0 }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-teal)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{name} Agent</span>
                      </div>
                      <div className="ml-3.5 h-2.5 rounded" style={{ background: "rgba(255,255,255,0.03)" }} />
                    </div>
                  )
                )}
              </div>
            )}
            {agentActivity.map((agent, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-gold)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{agent.agentName}</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{agent.findings}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
