"use client";

import { motion } from "motion/react";

const statCards = [
  { key: "activeGoals", label: "Active Goals", color: "bg-accent" },
  { key: "activeRoadmaps", label: "Active Roadmaps", color: "bg-accent-violet" },
  { key: "milestonesDone", label: "Milestones Done", color: "bg-emerald-500" },
  { key: "achievements", label: "Achievements", color: "bg-amber-500" },
];

export default function DashboardHome({
  digitalSelf,
  stats,
}: {
  digitalSelf: { knowledge: number; career: number; opportunity: number };
  stats: Record<string, number>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Your evolution at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="p-5 rounded-2xl bg-card border border-border"
          >
            <div
              className={`w-3 h-3 rounded-full ${card.color} mb-3`}
            />
            <p className="text-2xl font-bold">{stats[card.key]}</p>
            <p className="text-xs text-muted mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="font-semibold mb-6">Digital Self</h2>
          <div className="space-y-5">
            {[
              { label: "Knowledge", value: digitalSelf.knowledge, color: "bg-accent" },
              { label: "Career", value: digitalSelf.career, color: "bg-accent-violet" },
              {
                label: "Opportunity",
                value: digitalSelf.opportunity,
                color: "bg-emerald-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{item.label}</span>
                  <span className="text-muted">{item.value}%</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/dashboard/chat"
              className="block p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-card-hover transition-all"
            >
              <span className="text-sm font-medium">Chat with Nexus AI</span>
              <p className="text-xs text-muted mt-1">
                Talk to your agents and set new goals
              </p>
            </a>
            <a
              href="/dashboard/roadmap"
              className="block p-4 rounded-xl border border-border hover:border-accent-violet/30 hover:bg-card-hover transition-all"
            >
              <span className="text-sm font-medium">View Roadmaps</span>
              <p className="text-xs text-muted mt-1">
                Check your learning paths and milestones
              </p>
            </a>
            <a
              href="/dashboard/nexus"
              className="block p-4 rounded-xl border border-border hover:border-emerald-500/30 hover:bg-card-hover transition-all"
            >
              <span className="text-sm font-medium">My Nexus</span>
              <p className="text-xs text-muted mt-1">
                See your Digital Self evolution
              </p>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
