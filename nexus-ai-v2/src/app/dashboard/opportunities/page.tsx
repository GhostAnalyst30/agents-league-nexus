"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LinkIcon } from "@/components/ui/icons";

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  matchScore: number | null;
  matchReason: string | null;
  createdAt: string;
  connections: { id: string; status: string }[];
};

const typeColors: Record<string, string> = {
  hackathon: "bg-accent/10 text-accent border-accent/20",
  scholarship: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  internship: "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
  event: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  competition: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  course: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  grant: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const typeIcons: Record<string, string> = {
  hackathon: "⚡",
  scholarship: "🎓",
  internship: "💼",
  event: "📅",
  competition: "🏆",
  course: "📚",
  grant: "💰",
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "hackathon", description: "", url: "" });

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((data) => {
        setOpportunities(data);
        // Check if user can create (admin check via response)
        setIsAdmin(data.canCreate || false);
      })
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

  const oppTypes = ["hackathon", "scholarship", "internship", "event", "competition", "course", "grant"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-muted text-sm mt-1">Events, hackathons, scholarships matched to your profile</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all text-sm"
        >
          {showForm ? "Cancel" : "Add Opportunity"}
        </button>
      </div>

      {/* Admin form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={createOpportunity}
            className="p-6 rounded-2xl bg-card border border-border space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50"
              >
                {oppTypes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={3}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50 resize-none"
            />
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="URL (link to opportunity)"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50"
            />
            <button type="submit" className="px-4 py-2 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all text-sm">
              Create Opportunity
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Opportunities grid */}
      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <LinkIcon className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No opportunities available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {opportunities.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.04 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-accent/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcons[opp.type] || "📌"}</span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${typeColors[opp.type] || "bg-accent/10 text-accent"}`}>
                      {opp.type}
                    </span>
                  </div>
                  {opp.matchScore && (
                    <span className="text-xs text-muted">{Math.round(opp.matchScore)}% match</span>
                  )}
                </div>

                <h3 className="font-semibold mb-1.5">{opp.title}</h3>
                {opp.description && (
                  <p className="text-sm text-muted mb-3 line-clamp-3 leading-relaxed">{opp.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {opp.url && (
                      <a href={opp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                        Learn more →
                      </a>
                    )}
                    {opp.matchReason && (
                      <span className="text-[11px] text-muted italic">{opp.matchReason}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
