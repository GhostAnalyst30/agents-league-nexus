"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "@/components/ui/markdown";
import { AGENT_ICONS, BotIcon } from "@/components/ui/icons";

const AGENTS = [
  { name: "Goal Analysis", color: "bg-accent" },
  { name: "Skill Gap", color: "bg-accent-violet" },
  { name: "Learning Path", color: "bg-emerald-500" },
  { name: "Opportunity Matching", color: "bg-amber-500" },
  { name: "Profile Evolution", color: "bg-pink-500" },
  { name: "Future Simulation", color: "bg-cyan-500" },
];

const REASONING_MESSAGES: Record<string, string[]> = {
  "Goal Analysis": [
    "Analyzing your message for goals and intentions...",
    "Cross-referencing with past conversations...",
    "Goals identified and categorized.",
  ],
  "Skill Gap": [
    "Scanning your current skill set...",
    "Comparing against desired objectives...",
    "Gaps detected and prioritized.",
  ],
  "Learning Path": [
    "Designing personalized curriculum...",
    "Structuring milestones and timelines...",
    "Learning path optimized for you.",
  ],
  "Opportunity Matching": [
    "Searching relevant opportunities...",
    "Scoring matches against your profile...",
    "Best opportunities selected.",
  ],
  "Profile Evolution": [
    "Evaluating your growth trajectory...",
    "Calculating score changes...",
    "Profile evolution mapped.",
  ],
  "Future Simulation": [
    "Running scenario simulations...",
    "Analyzing success probabilities...",
    "Future paths projected.",
  ],
};

type AgentFindings = {
  name: string;
  summary: string;
  markdown: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  agentFindings?: AgentFindings[];
};

type AgentState = {
  status: "idle" | "thinking" | "done";
  reasoningStep: number;
  finding?: AgentFindings;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>(
    AGENTS.map(() => ({ status: "idle" as const, reasoningStep: 0 }))
  );
  const [allFindings, setAllFindings] = useState<AgentFindings[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToEnd(); }, [messages, loading, allFindings, agents, scrollToEnd]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setAllFindings([]);

    // Start all agents thinking sequentially
    setAgents(AGENTS.map(() => ({ status: "thinking", reasoningStep: 0 })));

    // Animate reasoning steps
    for (let step = 1; step <= 3; step++) {
      await new Promise((r) => setTimeout(r, 600));
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          reasoningStep: a.status === "thinking" ? step : a.reasoningStep,
        }))
      );
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      const findings: AgentFindings[] = (data.agents || []).map((a: any) => ({
        name: a.name,
        summary: a.output.summary,
        markdown: a.output.markdown,
      }));
      setAllFindings(findings);
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          status: "done",
          finding: findings.find((f) => f.name === AGENTS[prev.indexOf(a)]?.name),
        }))
      );

      // Brief pause to show done state, then show unified response
      await new Promise((r) => setTimeout(r, 800));

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, agentFindings: findings },
      ]);
      setLoading(false);
      setAgents(AGENTS.map(() => ({ status: "idle", reasoningStep: 0 })));
      setAllFindings([]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
      setLoading(false);
      setAgents(AGENTS.map(() => ({ status: "idle", reasoningStep: 0 })));
      setAllFindings([]);
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto space-y-4 pr-4 scroll-smooth">
          <AnimatePresence>
            {messages.length === 0 && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <BotIcon className="w-12 h-12 text-accent mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nexus AI</h2>
                <p className="text-sm text-muted max-w-sm">
                  Six agents work together to analyze your goals, skills, and opportunities.
                </p>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-accent/10 text-foreground" : "bg-card border border-border"
                }`}>
                  {msg.role === "assistant" ? <Markdown content={msg.content} /> : msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Agent reasoning messages */}
          {loading && (
            <div className="space-y-3">
              {AGENTS.map((agent, i) => {
                const state = agents[i];
                if (state.status === "idle") return null;
                const msgs = REASONING_MESSAGES[agent.name] || [];
                const stepMsg = msgs[Math.min(state.reasoningStep, msgs.length - 1)];

                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-3 items-start"
                  >
                    <div className={`w-7 h-7 rounded-lg ${agent.color}/15 flex items-center justify-center shrink-0 mt-0.5`}>
                      {AGENT_ICONS[agent.name]({
                        className: `w-4 h-4 ${agent.color.replace("bg-", "text-")}`,
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium">{agent.name}</span>
                        {state.status === "thinking" && (
                          <span className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0s" }} />
                            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.15s" }} />
                            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.3s" }} />
                          </span>
                        )}
                        {state.status === "done" && (
                          <span className="text-[10px] text-emerald-500 font-medium">✓ Done</span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${state.status === "done" ? "text-emerald-500/70" : "text-muted"}`}>
                        {stepMsg}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Individual findings before unified response */}
          {allFindings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-card/50 border border-border rounded-2xl p-4 space-y-2 max-w-[85%]">
                <p className="text-xs text-muted font-medium uppercase tracking-wider mb-2">Agent Analysis Complete</p>
                {allFindings.map((f) => (
                  <div key={f.name} className="text-xs leading-relaxed">
                    <span className="font-medium text-accent">{f.name}:</span>{" "}
                    <span className="text-muted">{f.summary}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nexus AI anything..."
            className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-colors outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shrink-0"
          >
            Send
          </button>
        </form>
      </div>

      {/* Agent sidebar - shows individual findings */}
      <div className="w-60 shrink-0 space-y-3">
        <p className="text-xs text-muted font-medium uppercase tracking-wider">Agents</p>
        {AGENTS.map((agent, i) => {
          const state = agents[i];
          const Icon = AGENT_ICONS[agent.name];
          const finding = allFindings.find((f) => f.name === agent.name) || state.finding;

          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border text-sm transition-all ${
                state.status === "thinking"
                  ? "bg-accent/5 border-accent/20"
                  : state.status === "done"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-transparent border-transparent opacity-40"
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className={`w-7 h-7 rounded-lg ${agent.color}/15 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${agent.color.replace("bg-", "text-")}`} />
                </div>
                <span className="flex-1 truncate text-xs font-medium">{agent.name}</span>
                {state.status === "thinking" && (
                  <span className={`w-2 h-2 rounded-full ${agent.color} animate-pulse`} />
                )}
                {state.status === "done" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>

              {/* Individual agent finding (full markdown) */}
              <AnimatePresence>
                {state.status === "done" && finding && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3"
                  >
                    <div className="border-t border-border/50 pt-2 mt-0">
                      <div className="text-[11px] text-muted leading-relaxed">
                        <Markdown content={finding.markdown} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
