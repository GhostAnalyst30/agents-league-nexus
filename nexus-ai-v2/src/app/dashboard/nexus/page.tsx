"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

type DigitalSelfData = {
  digitalSelf: { knowledge: number; career: number; opportunity: number };
  stats: {
    activeGoals: number;
    activeRoadmaps: number;
    milestonesDone: number;
    achievements: number;
  };
  recentGoals: { id: string; title: string; status: string }[];
};

const avatarConfig = [
  {
    key: "knowledge" as const,
    label: "Knowledge Self",
    emoji: "🧠",
    desc: "Learning, skills, education",
    color: "bg-accent",
    border: "border-accent",
  },
  {
    key: "career" as const,
    label: "Career Self",
    emoji: "💼",
    desc: "Projects, professional growth",
    color: "bg-accent-violet",
    border: "border-accent-violet",
  },
  {
    key: "opportunity" as const,
    label: "Opportunity Self",
    emoji: "🌐",
    desc: "Networking, events, community",
    color: "bg-emerald-500",
    border: "border-emerald-500",
  },
];

export default function MyNexusPage() {
  const [data, setData] = useState<DigitalSelfData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/digital-self")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!data) return <p className="text-muted">Failed to load data</p>;

  const { digitalSelf: ds, stats, recentGoals } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Nexus</h1>
        <p className="text-muted text-sm mt-1">
          Your Digital Self evolution dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {avatarConfig.map((avatar, i) => {
          const score = ds[avatar.key];
          return (
            <motion.div
              key={avatar.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border text-center"
            >
              <div
                className={`w-16 h-16 rounded-full ${avatar.color}/20 flex items-center justify-center mx-auto mb-4 border-2 ${avatar.border}/30`}
              >
                <span className="text-3xl">{avatar.emoji}</span>
              </div>
              <h3 className="font-semibold mb-1">{avatar.label}</h3>
              <p className="text-3xl font-bold mb-1">{score}%</p>
              <p className="text-xs text-muted">{avatar.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Goals", value: stats.activeGoals },
          { label: "Active Roadmaps", value: stats.activeRoadmaps },
          { label: "Milestones Done", value: stats.milestonesDone },
          { label: "Achievements", value: stats.achievements },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-card border border-border text-center"
          >
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {recentGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="font-semibold mb-4">Recent Goals</h2>
          <div className="space-y-3">
            {recentGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{goal.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    goal.status === "active"
                      ? "bg-accent/10 text-accent"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {goal.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
