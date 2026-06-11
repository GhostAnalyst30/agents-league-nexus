"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

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
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/roadmaps")
      .then((r) => r.json())
      .then(setRoadmaps)
      .finally(() => setLoading(false));
  }, []);

  async function createRoadmap(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/roadmaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      const roadmap = await res.json();
      setRoadmaps((prev) => [roadmap, ...prev]);
      setTitle("");
      setDescription("");
      setShowForm(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roadmaps</h1>
          <p className="text-muted text-sm mt-1">Your personalized learning paths</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all text-sm"
        >
          {showForm ? "Cancel" : "New Roadmap"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={createRoadmap}
          className="p-6 rounded-2xl bg-card border border-border space-y-4"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Roadmap title"
            required
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50 resize-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all text-sm"
          >
            Create
          </button>
        </motion.form>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : roadmaps.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">No roadmaps yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {roadmaps.map((rm, i) => {
            const done = rm.milestones.filter((m) => m.completed).length;
            const total = rm.milestones.length;
            return (
              <motion.div
                key={rm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      rm.status === "active"
                        ? "bg-accent/10 text-accent"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {rm.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{
                        width: `${total > 0 ? (done / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted">
                    {done}/{total}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {rm.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          m.completed
                            ? "border-accent bg-accent"
                            : "border-muted-foreground"
                        }`}
                      >
                        {m.completed && (
                          <span className="text-[8px] text-background">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          m.completed ? "line-through text-muted" : ""
                        }
                      >
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
