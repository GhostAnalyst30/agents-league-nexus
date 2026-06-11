"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  matchScore: number | null;
  matchReason: string | null;
  connections: { id: string; status: string }[];
};

const typeColors: Record<string, string> = {
  hackathon: "bg-accent/10 text-accent",
  scholarship: "bg-emerald-500/10 text-emerald-500",
  internship: "bg-accent-violet/10 text-accent-violet",
  event: "bg-amber-500/10 text-amber-500",
  competition: "bg-pink-500/10 text-pink-500",
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "hackathon", description: "", url: "" });

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then(setOpportunities)
      .finally(() => setLoading(false));
  }, []);

  async function createOpportunity(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const opp = await res.json();
      setOpportunities((prev) => [{ ...opp, connections: [] }, ...prev]);
      setForm({ title: "", type: "hackathon", description: "", url: "" });
      setShowForm(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-muted text-sm mt-1">
            Events, hackathons, scholarships matched to you
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all text-sm"
        >
          {showForm ? "Cancel" : "Add Opportunity"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={createOpportunity}
          className="p-6 rounded-2xl bg-card border border-border space-y-4"
        >
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm"
          >
            <option value="hackathon">Hackathon</option>
            <option value="scholarship">Scholarship</option>
            <option value="internship">Internship</option>
            <option value="event">Event</option>
            <option value="competition">Competition</option>
          </select>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm resize-none"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="URL"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm"
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
      ) : opportunities.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">No opportunities yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp, i) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    typeColors[opp.type] || "bg-accent/10 text-accent"
                  }`}
                >
                  {opp.type}
                </span>
                {opp.matchScore && (
                  <span className="text-xs text-muted">
                    Match: {Math.round(opp.matchScore)}%
                  </span>
                )}
              </div>

              <h3 className="font-semibold mb-1">{opp.title}</h3>
              {opp.description && (
                <p className="text-sm text-muted mb-4 line-clamp-2">
                  {opp.description}
                </p>
              )}

              <div className="flex items-center gap-3">
                {opp.url && (
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline"
                  >
                    Learn more →
                  </a>
                )}
                {opp.matchReason && (
                  <span className="text-xs text-muted">{opp.matchReason}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
