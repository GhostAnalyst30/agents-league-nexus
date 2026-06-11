"use client";

import { motion } from "motion/react";

const steps = [
  { num: "01", title: "Connect", desc: "Sign up and tell Nexus about your goals, skills, and aspirations." },
  { num: "02", title: "Analyze", desc: "Six agents analyze your profile to identify gaps and opportunities." },
  { num: "03", title: "Plan", desc: "Receive a personalized roadmap with milestones and resources." },
  { num: "04", title: "Act", desc: "Track progress, earn achievements, and watch your Digital Self evolve." },
  { num: "05", title: "Evolve", desc: "Nexus continuously learns and adapts as you grow." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted max-w-xl mx-auto">
            From connection to evolution in five simple steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[1.125rem] top-0 bottom-0 w-px bg-border hidden sm:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-6 items-start"
              >
                <div className="relative z-10 shrink-0 w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">{step.num}</span>
                </div>
                <div className="pt-1.5">
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
