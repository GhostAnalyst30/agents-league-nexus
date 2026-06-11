"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RouteIcon, SparklesIcon } from "@/components/ui/icons";

type Milestone = { id: string; title: string; completed: boolean; order: number };
type Roadmap = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  milestones: Milestone[];
};

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    fetch("/api/roadmaps")
      .then((r) => r.json())
      .then(setRoadmaps)
      .finally(() => setLoading(false));
  }, []);

  async function generateWithAI() {
    if (!goalInput.trim() || generating) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate a detailed learning roadmap for: ${goalInput}. Include milestones with estimated days. Return the roadmap data as structured JSON.`,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      // Refresh roadmaps after AI generation
      const updated = await fetch("/api/roadmaps").then((r) => r.json());
      setRoadmaps(updated);
      setGoalInput("");
    } catch {
      // fallback: create a basic roadmap
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalInput,
          description: "AI-generated learning path",
        }),
      });
      if (res.ok) {
        const roadmap = await res.json();
        setRoadmaps((prev) => [roadmap, ...prev]);
        setGoalInput("");
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Roadmaps</h1>
        <p className="text-muted text-sm mt-1">AI-generated learning paths based on your goals</p>
      </div>

      {/* AI Generator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Generate Roadmap with AI</h2>
            <p className="text-xs text-muted">Describe what you want to learn or achieve</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g., I want to become a machine learning engineer"
            className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50"
            disabled={generating}
          />
          <button
            onClick={generateWithAI}
            disabled={generating || !goalInput.trim()}
            className="px-5 py-2.5 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Generating
              </span>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </motion.div>

      {/* Roadmap list */}
      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : roadmaps.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <RouteIcon className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No roadmaps yet. Tell the AI what you want to learn.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {roadmaps.map((rm, i) => {
              const done = rm.milestones.filter((m) => m.completed).length;
              const total = rm.milestones.length;
              const progress = total > 0 ? (done / total) * 100 : 0;

              return (
                <motion.div
                  key={rm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{rm.title}</h3>
                      {rm.description && (
                        <p className="text-sm text-muted mt-1">{rm.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      rm.status === "active" ? "bg-accent/10 text-accent" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {rm.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-muted">{Math.round(progress)}%</span>
                  </div>

                  <div className="space-y-2">
                    {rm.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 text-sm">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          m.completed ? "border-accent bg-accent" : "border-muted-foreground"
                        }`}>
                          {m.completed && <span className="text-[8px] text-background">✓</span>}
                        </div>
                        <span className={m.completed ? "line-through text-muted" : ""}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
