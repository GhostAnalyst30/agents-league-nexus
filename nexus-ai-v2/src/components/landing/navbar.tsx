"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <a href="/" className="font-bold text-lg tracking-tight">
          Nexus <span className="text-accent">AI</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="#agents" className="text-sm text-muted hover:text-foreground transition-colors">
            Agents
          </a>
          <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">
            How It Works
          </a>
          <a
            href="/auth/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Sign In
          </a>
          <a
            href="/auth/register"
            className="text-sm px-4 py-2 bg-accent text-background font-medium rounded-lg hover:brightness-110 transition-all"
          >
            Get Started
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
