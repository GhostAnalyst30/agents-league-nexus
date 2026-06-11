"use client";

import { motion } from "motion/react";

const avatars = [
  {
    label: "Knowledge Self",
    emoji: "🧠",
    desc: "Learning, skills, education",
    color: "bg-accent",
    glow: "glow",
  },
  {
    label: "Career Self",
    emoji: "💼",
    desc: "Projects, professional growth, experience",
    color: "bg-accent-violet",
    glow: "glow-violet",
  },
  {
    label: "Opportunity Self",
    emoji: "🌐",
    desc: "Networking, events, community participation",
    color: "bg-emerald-500",
    glow: "shadow-lg shadow-emerald-500/20",
  },
];

export default function DigitalSelfSection() {
  return (
    <section className="py-24 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your Digital Self
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Three evolving avatars that represent your growth in real time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {avatars.map((avatar, i) => (
            <motion.div
              key={avatar.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className={`p-8 rounded-2xl bg-card border border-border text-center ${avatar.glow}`}
            >
              <div
                className={`w-16 h-16 rounded-full ${avatar.color}/20 flex items-center justify-center mx-auto mb-4`}
              >
                <span className="text-3xl">{avatar.emoji}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{avatar.label}</h3>
              <p className="text-sm text-muted">{avatar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
