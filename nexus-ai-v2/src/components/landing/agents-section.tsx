"use client";

import { motion } from "motion/react";

const agents = [
  {
    emoji: "🎯",
    title: "Goal Analysis",
    desc: "Detects goals, intentions, and ambitions from your conversations",
  },
  {
    emoji: "🔍",
    title: "Skill Gap",
    desc: "Analyzes current skills vs. desired goals to find what's missing",
  },
  {
    emoji: "🗺️",
    title: "Learning Path",
    desc: "Creates personalized roadmaps with milestones and resources",
  },
  {
    emoji: "🔗",
    title: "Opportunity Matching",
    desc: "Matches you with events, hackathons, and scholarships",
  },
  {
    emoji: "📈",
    title: "Profile Evolution",
    desc: "Tracks growth and updates your Digital Self in real time",
  },
  {
    emoji: "🔮",
    title: "Future Simulation",
    desc: "Simulates scenarios and estimates success probability",
  },
];

export default function AgentsSection() {
  return (
    <section id="agents" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Six Specialized Agents
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            A network of reasoning agents working together to understand,
            analyze, and evolve with you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:bg-card-hover transition-all"
            >
              <span className="text-2xl mb-3 block">{agent.emoji}</span>
              <h3 className="font-semibold mb-2">{agent.title}</h3>
              <p className="text-sm text-muted leading-relaxed">
                {agent.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
