"use client";

import { motion } from "motion/react";

type BodyAvatarProps = {
  label: string;
  emoji: string;
  score: number;
  color: string;
  stats: { label: string; value: number }[];
  evolution: "initial" | "current" | "projected";
};

function BodyDiagram({ color, score }: { color: string; score: number }) {
  const glow = score / 100;
  const strokeColor = color.replace("bg-", "#");
  const fillColor = `${strokeColor}${Math.round(20 + glow * 30).toString(16).padStart(2, "0")}`;

  return (
    <svg viewBox="0 0 120 200" className="w-24 h-40 mx-auto">
      <defs>
        <radialGradient id={`glow-${color}`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15 + glow * 0.2} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow */}
      <circle cx="60" cy="80" r="50" fill={`url(#glow-${color})`} />

      {/* Head */}
      <motion.ellipse
        cx="60" cy="28" rx="16" ry="18"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Eyes */}
      <circle cx="53" cy="26" r="2" fill={strokeColor} />
      <circle cx="67" cy="26" r="2" fill={strokeColor} />

      {/* Body */}
      <motion.path
        d="M44 48 L44 100 Q44 110 60 112 Q76 110 76 100 L76 48 Q76 42 60 40 Q44 42 44 48Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
      />

      {/* Arms */}
      <motion.line
        x1="44" y1="55" x2="28" y2="80"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.line
        x1="76" y1="55" x2="92" y2="80"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Legs */}
      <motion.line
        x1="50" y1="110" x2="45" y2="150"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.line
        x1="70" y1="110" x2="75" y2="150"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Pulse ring */}
      <motion.circle
        cx="60" cy="80" r={30 + score * 0.2}
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.5"
        strokeOpacity={0.3 + glow * 0.4}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Score text */}
      <text x="60" y="178" textAnchor="middle" fill={strokeColor} fontSize="14" fontWeight="bold">
        {score}%
      </text>
    </svg>
  );
}

export default function BodyAvatar({ label, emoji, score, color, stats, evolution }: BodyAvatarProps) {
  const evolutionLabel = {
    initial: "Current State",
    current: "Current State",
    projected: "Projected Future",
  };

  const evolutionDesc = {
    initial: "Your starting point",
    current: "Your current evolution",
    projected: "Where you're heading",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-border text-center"
    >
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-${color.replace("bg-", "")}/10 text-${color.replace("bg-", "")} mb-4 inline-block`}>
        {evolutionLabel[evolution]}
      </span>

      <BodyDiagram color={color} score={score} />

      <div className="flex items-center justify-center gap-2 mt-4 mb-1">
        <span className="text-xl">{emoji}</span>
        <h3 className="font-semibold">{label}</h3>
      </div>
      <p className="text-xs text-muted mb-4">{evolutionDesc[evolution]}</p>

      <div className="space-y-2 text-left">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between text-xs">
            <span className="text-muted">{stat.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
              <span className="font-medium w-6 text-right">{stat.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
