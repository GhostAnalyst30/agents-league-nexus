"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import BodyAvatar from "@/components/ui/body-avatar";

type DigitalSelfData = {
  digitalSelf: { knowledge: number; career: number; opportunity: number };
  stats: { activeGoals: number; activeRoadmaps: number; milestonesDone: number; achievements: number };
  recentGoals: { id: string; title: string; status: string }[];
};

const AVATARS = [
  {
    key: "knowledge" as const,
    label: "Knowledge Self",
    emoji: "🧠",
    color: "bg-accent",
    desc: "Learning, skills, education",
    stats: [
      { label: "Learning", value: 0 },
      { label: "Skills Mastery", value: 0 },
      { label: "Education", value: 0 },
    ],
  },
  {
    key: "career" as const,
    label: "Career Self",
    emoji: "💼",
    color: "bg-accent-violet",
    desc: "Projects, professional growth, experience",
    stats: [
      { label: "Projects", value: 0 },
      { label: "Experience", value: 0 },
      { label: "Network", value: 0 },
    ],
  },
  {
    key: "opportunity" as const,
    label: "Opportunity Self",
    emoji: "🌐",
    color: "bg-emerald-500",
    desc: "Networking, events, community participation",
    stats: [
      { label: "Engagement", value: 0 },
      { label: "Community", value: 0 },
      { label: "Growth", value: 0 },
    ],
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

  if (loading) return <p className="text-muted text-sm mt-8">Loading...</p>;
  if (!data) return <p className="text-muted mt-8">Failed to load data</p>;

  const { digitalSelf: ds, stats } = data;

  const avatarData = AVATARS.map((a) => ({
    ...a,
    score: ds[a.key],
    stats: a.stats.map((s, i) => ({
      ...s,
      value: Math.max(0, Math.min(100, ds[a.key] + (i - 1) * 10 + Math.floor(Math.random() * 15))),
    })),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Nexus</h1>
        <p className="text-muted text-sm mt-1">Your three digital twins — past, present, and future</p>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { label: "Active Goals", value: stats.activeGoals, icon: "🎯" },
          { label: "Active Roadmaps", value: stats.activeRoadmaps, icon: "🗺️" },
          { label: "Milestones Done", value: stats.milestonesDone, icon: "✅" },
          { label: "Achievements", value: stats.achievements, icon: "🏆" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border text-center">
            <span className="text-lg">{stat.icon}</span>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Three digital twins */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {avatarData.map((avatar, i) => (
          <motion.div
            key={avatar.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
          >
            <BodyAvatar
              label={avatar.label}
              emoji={avatar.emoji}
              score={avatar.score}
              color={avatar.color}
              stats={avatar.stats}
              evolution={i === 1 ? "current" : i === 0 ? "initial" : "projected"}
            />
          </motion.div>
        ))}
      </div>

      {/* Evolution timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h2 className="font-semibold mb-4">Evolution Timeline</h2>
        <div className="flex items-center gap-4">
          {[
            { label: "Initial", score: 0, color: "bg-muted-foreground" },
            { label: "Current", score: Math.round((ds.knowledge + ds.career + ds.opportunity) / 3), color: "bg-accent" },
            { label: "Projected", score: Math.min(100, Math.round((ds.knowledge + ds.career + ds.opportunity) / 3) + 25), color: "bg-emerald-500" },
          ].map((stage, i) => (
            <div key={stage.label} className="flex-1 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.15, type: "spring" }}
                className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm`}
              >
                {stage.score}%
              </motion.div>
              <p className="text-xs text-muted">{stage.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent goals */}
      {data.recentGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="font-semibold mb-4">Recent Goals</h2>
          <div className="space-y-2">
            {data.recentGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                <span>{goal.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  goal.status === "active" ? "bg-accent/10 text-accent" : "bg-emerald-500/10 text-emerald-500"
                }`}>
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
