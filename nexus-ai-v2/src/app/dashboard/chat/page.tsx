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

type Status = "idle" | "active" | "done";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>(
    AGENTS.map(() => "idle" as Status)
  );
  const [findings, setFindings] = useState<AgentFindings[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading, findings, scrollToEnd]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setFindings([]);
    setStatuses(AGENTS.map(() => "active"));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      // Mark all agents as done and collect findings
      const agentFindings: AgentFindings[] = (data.agents || []).map(
        (a: any) => ({
          name: a.name,
          summary: a.output.summary,
          markdown: a.output.markdown,
        })
      );
      setFindings(agentFindings);
      setStatuses(AGENTS.map(() => "done"));

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            agentFindings,
          },
        ]);
        setLoading(false);
        setFindings([]);
        setStatuses(AGENTS.map(() => "idle"));
      }, 600);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
      setLoading(false);
      setStatuses(AGENTS.map(() => "idle"));
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto space-y-4 pr-4 scroll-smooth">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BotIcon className="w-12 h-12 text-accent mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nexus AI</h2>
              <p className="text-sm text-muted max-w-sm">
                Ask me anything about your goals, skills, or future path. Six
                specialized agents work together to help you grow.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent/10 text-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Markdown content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Reasoning animation */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 min-w-[280px]">
                {AGENTS.map((agent, i) => (
                  <div
                    key={agent.name}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${agent.color}/15 flex items-center justify-center`}
                    >
                      {AGENT_ICONS[agent.name]({
                        className: `w-4 h-4 ${agent.color.replace("bg-", "text-")}`,
                      })}
                    </div>
                    <span className="text-xs font-medium flex-1">
                      {agent.name}
                    </span>
                    <span className="flex gap-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${agent.color} animate-bounce`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${agent.color} animate-bounce`}
                        style={{ animationDelay: `${i * 0.1 + 0.15}s` }}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${agent.color} animate-bounce`}
                        style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Individual findings during transition */}
          {findings.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3 min-w-[280px]">
                {findings.map((f) => (
                  <div key={f.name} className="text-sm">
                    <span className="font-medium text-accent">{f.name}:</span>{" "}
                    <span className="text-muted">{f.summary}</span>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Agent sidebar */}
      <div className="w-60 shrink-0 space-y-3">
        <p className="text-xs text-muted font-medium uppercase tracking-wider">
          Agents
        </p>
        {AGENTS.map((agent, i) => {
          const status = loading ? statuses[i] : "idle";
          const Icon = AGENT_ICONS[agent.name];
          const finding = findings.find((f) => f.name === agent.name);

          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border text-sm transition-all ${
                status === "active"
                  ? "bg-accent/5 border-accent/20"
                  : status === "done"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-transparent border-transparent opacity-40"
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div
                  className={`w-7 h-7 rounded-lg ${agent.color}/15 flex items-center justify-center`}
                >
                  <Icon
                    className={`w-4 h-4 ${agent.color.replace("bg-", "text-")}`}
                  />
                </div>
                <span className="flex-1 truncate text-xs font-medium">
                  {agent.name}
                </span>
                {status === "active" && (
                  <span
                    className={`w-2 h-2 rounded-full ${agent.color} animate-pulse`}
                  />
                )}
                {status === "done" && finding && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>

              {/* Expandable finding */}
              <AnimatePresence>
                {status === "done" && finding && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-2.5"
                  >
                    <p className="text-[11px] text-muted leading-relaxed border-t border-border/50 pt-2 mt-0">
                      {finding.summary}
                    </p>
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
