"use client";

import { motion } from "motion/react";

export default function CtaSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Begin Your Evolution
          </h2>
          <p className="text-muted max-w-lg mx-auto mb-10 leading-relaxed">
            Join Nexus and start building your Digital Self. Your journey,
            your growth, your future.
          </p>
          <a
            href="/auth/register"
            className="inline-block px-10 py-4 bg-accent text-background font-semibold rounded-xl hover:brightness-110 transition-all glow text-lg"
          >
            Get Started Free
          </a>
        </motion.div>
      </div>
    </section>
  );
}
