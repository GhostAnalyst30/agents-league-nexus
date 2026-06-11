"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible")
        })
      },
      { threshold: 0.02, rootMargin: "0px 0px -10px 0px" }
    )

    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top <= window.innerHeight + 200 && rect.bottom >= -200) {
        el.classList.add("visible")
      } else {
        observer.observe(el)
      }
    })

    document.querySelectorAll("[data-stagger]").forEach((container) => {
      const children = container.children
      const staggerObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            Array.from(children).forEach((child, i) => {
              setTimeout(() => (child as HTMLElement).classList.add("visible"), i * 80)
            })
            staggerObserver.unobserve(container)
          }
        },
        { threshold: 0.02, rootMargin: "0px 0px -10px 0px" }
      )
      const containerRect = container.getBoundingClientRect()
      if (containerRect.top <= window.innerHeight + 200 && containerRect.bottom >= -200) {
        Array.from(children).forEach((child, i) => {
          setTimeout(() => (child as HTMLElement).classList.add("visible"), i * 80)
        })
      } else {
        staggerObserver.observe(container)
      }
    })

    return () => observer.disconnect()
  }, [])
}

function StatCounter({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const duration = 2400
          const steps = 42
          const inc = target / steps
          let c = 0
          const interval = setInterval(() => {
            c += inc
            if (c >= target) {
              setCount(target)
              clearInterval(interval)
            } else {
              setCount(Math.floor(c * 10 ** decimals) / 10 ** decimals)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, decimals])

  return (
    <span ref={ref} className="tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
      {count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

function AmbientBackground() {
  return <div className="ambient-bg" aria-hidden="true" />
}

const agents = [
  { name: "Goal Analysis", role: "Detects goals, intentions & motivations with deep reasoning", activity: 92, color: "var(--accent-primary)", icon: "◈" },
  { name: "Skill Gap", role: "Identifies what you need to learn next to close gaps", activity: 88, color: "var(--accent-warm)", icon: "◇" },
  { name: "Learning Path", role: "Creates personalized, adaptive learning roadmaps", activity: 85, color: "var(--accent-secondary)", icon: "◉" },
  { name: "Opportunity Matching", role: "Finds events, hackathons & scholarships matched to you", activity: 79, color: "var(--accent-rose)", icon: "◎" },
  { name: "Profile Evolution", role: "Tracks growth and continuously updates Digital Self", activity: 91, color: "var(--accent-primary)", icon: "⬡" },
  { name: "Future Simulation", role: "Simulates scenarios & outcomes to guide decisions", activity: 76, color: "var(--accent-warm)", icon: "◈" },
]

const features = [
  { title: "Living Human Model", desc: "A continuously evolving Digital Self that grows with every action you take.", icon: "◈", color: "var(--accent-primary)", wide: true },
  { title: "Multi-Agent Reasoning", desc: "Six specialized agents working in orchestration to analyze and guide you.", icon: "◇", color: "var(--accent-warm)" },
  { title: "Personalized Roadmaps", desc: "Dynamic learning paths that adapt to your goals and your progress.", icon: "◉", color: "var(--accent-secondary)" },
  { title: "Opportunity Engine", desc: "Smart matching with events, hackathons, scholarships, and more.", icon: "◎", color: "var(--accent-rose)", wide: true },
  { title: "Future Simulation", desc: "Compare different paths to see success probabilities before you commit.", icon: "⬡", color: "var(--accent-warm)" },
  { title: "Persistent Memory", desc: "Nexus remembers everything. Each conversation deepens its understanding.", icon: "◈", color: "var(--accent-primary)" },
]

const steps = [
  { num: "01", title: "Share Your Intention", desc: "Tell Nexus what you want to achieve. It listens deeply and begins constructing your initial Digital Self model." },
  { num: "02", title: "Multi-Agent Analysis", desc: "Six reasoning agents analyze your goals, skills, gaps, and opportunities simultaneously." },
  { num: "03", title: "Receive Your Roadmap", desc: "A personalized learning path with milestones, resources, and timelines appears — tailored to you." },
  { num: "04", title: "Grow, Then Repeat", desc: "Every action updates your Digital Self. The system evolves as you evolve." },
]

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  useScrollReveal()

  useEffect(() => {
    setMounted(true)
    if (session) router.push("/dashboard")
  }, [session, router])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setParallax({ x: x * 14, y: y * 14 })
  }, [])

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    e.currentTarget.style.setProperty("--mouse-x", `${x}%`)
    e.currentTarget.style.setProperty("--mouse-y", `${y}%`)
  }, [])

  if (!mounted) return null

  return (
    <div id="main-content" className="min-h-[100dvh] overflow-x-hidden">
      <AmbientBackground />

      {/* ── NAV ── */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
        <div className="premium-card premium-card-glass flex items-center justify-between !py-2.5 !px-2 !rounded-full">
          <Link href="/" className="flex items-center gap-2.5 pl-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, var(--accent-warm), #d97706)",
                color: "var(--bg-abyss)",
              }}
            >
              N
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text-primary)" }}>
              Nexus
            </span>
          </Link>
          <div className="flex items-center gap-1.5 pr-1.5">
            {session ? (
              <Link href="/dashboard" className="btn btn-primary !py-2 !px-4 !text-xs">
                Dashboard
                <span className="btn-icon">→</span>
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost !py-2 !px-3.5 !text-xs">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn btn-primary !py-2 !px-4 !text-xs">
                  Get Started
                  <span className="btn-icon">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[100dvh] flex items-center pt-24 pb-16 px-6 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full"
            style={{
              background: "var(--accent-warm)",
              filter: "blur(100px)",
              opacity: 0.04,
              transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)`,
              transition: "transform 0.4s var(--ease-out)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full"
            style={{
              background: "var(--accent-primary)",
              filter: "blur(90px)",
              opacity: 0.04,
              transform: `translate(${parallax.x * -0.4}px, ${parallax.y * -0.4}px)`,
              transition: "transform 0.45s var(--ease-out)",
            }}
          />
        </div>

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8"
              >
                <div className="pill">
                  <span className="pill-dot pill-dot--cosmos" />
                  Human Evolution OS · v1.0
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-8"
              >
                <span style={{ color: "var(--text-primary)" }}>Don&apos;t just</span>
                <br />
                <span className="italic" style={{ color: "var(--text-secondary)", fontWeight: 400 }}>ask for answers.</span>
                <br />
                <span style={{ color: "var(--text-primary)" }}>Build a future</span>
                <br />
                <span style={{ color: "var(--text-primary)" }}>with AI that</span>
                <br />
                <span style={{ color: "var(--accent-primary)" }}>grows with you.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="text-base md:text-lg max-w-lg leading-relaxed mb-10"
                style={{ color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75 }}
              >
                Nexus AI is not a chatbot. It&apos;s a network of reasoning agents that continuously learn who you are,
                what you want, and how to help you grow beyond your limits.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link href="/auth/register" className="btn btn-primary">
                  Start Your Evolution
                  <span className="btn-icon">→</span>
                </Link>
                <a href="#agents" className="btn btn-secondary">
                  Meet the Agents
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 mt-20"
              >
                <div className="h-10 w-px" style={{ background: "linear-gradient(180deg, var(--accent-primary), transparent)" }} />
                <span className="text-[10px] tracking-[0.18em] uppercase font-semibold" style={{ color: "var(--text-muted)" }}>
                  Scroll to explore
                </span>
              </motion.div>
            </div>

            {/* Right — Digital Self Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex items-center justify-center"
            >
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, var(--accent-primary), var(--accent-secondary), var(--accent-warm), var(--accent-primary))",
                    filter: "blur(60px)",
                    opacity: 0.2,
                    animation: "spin 8s linear infinite",
                  }}
                  aria-hidden="true"
                />
                <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                  <div
                    className="absolute inset-0 rounded-full border animate-spin"
                    style={{ borderColor: "rgba(129, 140, 248, 0.15)", animationDuration: "35s" }}
                  />
                  <div
                    className="absolute rounded-full border animate-spin"
                    style={{
                      inset: "20px",
                      borderColor: "rgba(255,255,255,0.04)",
                      animationDuration: "28s",
                      animationDirection: "reverse",
                    }}
                  />
                  <div
                    className="absolute rounded-full border"
                    style={{
                      inset: "40px",
                      borderColor: "rgba(251, 113, 133, 0.1)",
                      animation: "spin 22s linear infinite reverse",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        background: "var(--bg-abyss)",
                        border: "2px solid",
                        borderImage: "linear-gradient(135deg, var(--accent-primary), var(--accent-warm)) 1",
                        boxShadow: "0 0 60px var(--accent-primary-soft), 0 0 120px rgba(129, 140, 248, 0.08)",
                      }}
                    >
                      <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                        N
                      </span>
                    </div>
                  </div>
                  {[
                    { label: "K", angle: 0, color: "var(--accent-primary)", x: 0, y: -145 },
                    { label: "C", angle: 120, color: "var(--accent-warm)", x: 125, y: 72 },
                    { label: "X", angle: 240, color: "var(--accent-rose)", x: -125, y: 72 },
                  ].map((node) => (
                    <div
                      key={node.label}
                      className="absolute w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: node.color,
                        color: "#fff",
                        left: `calc(50% + ${node.x}px - 18px)`,
                        top: `calc(50% + ${node.y}px - 18px)`,
                        boxShadow: `0 0 24px ${node.color}55`,
                      }}
                    >
                      {node.label}
                    </div>
                  ))}
                </div>
                <div
                  className="absolute -right-6 top-12 px-3 py-2 rounded-full"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    animation: "float 5s ease-in-out infinite",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: "var(--accent-secondary)" }}>● 6 Active Agents</span>
                </div>
                <div
                  className="absolute -left-8 bottom-16 px-3 py-2 rounded-full"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    animation: "float 6s ease-in-out infinite 1.5s",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: "var(--accent-warm)" }}>◈ 24/7 Evolution</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section">
        <div className="container">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            {[
              { value: 6, suffix: "+", label: "Reasoning Agents" },
              { value: 10, suffix: "x", label: "Growth Velocity" },
              { value: 98, suffix: "%", label: "Goal Precision" },
              { value: 24, suffix: "/7", label: "Active Evolution" },
            ].map((stat, i) => (
              <div key={stat.label} className="reveal text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  <StatCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-[11px] tracking-[0.1em] uppercase font-semibold" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto mt-12 divider-accent" />
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section id="agents" className="section">
        <div className="container">
          <div className="mb-20 max-w-2xl">
            <div className="reveal pill mb-6">
              <span className="pill-dot pill-dot--cosmos" />
              Your Ecosystem
            </div>
            <h2
              className="reveal text-4xl md:text-5xl lg:text-6xl mb-5 leading-[1.05]"
              style={{ color: "var(--text-primary)", transitionDelay: "100ms" }}
            >
              Your Personal
              <br />
              <span className="italic font-normal" style={{ color: "var(--text-secondary)" }}>Agent Ecosystem</span>
            </h2>
            <p
              className="reveal text-base md:text-lg max-w-md leading-relaxed"
              style={{ color: "var(--text-secondary)", transitionDelay: "200ms", fontWeight: 300 }}
            >
              Six specialized reasoning agents working in orchestration to understand, analyze, and guide your personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="premium-card"
                onMouseMove={handleCardMouseMove}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl">{agent.icon}</span>
                  <span className="text-[11px] font-bold tracking-wide" style={{ color: agent.color }}>
                    {agent.activity}%
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                  {agent.name}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
                  {agent.role}
                </p>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${agent.activity}%`,
                      background: agent.color,
                      color: agent.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIGITAL SELF ── */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 right-0 w-[450px] h-[450px] rounded-full"
            style={{ background: "var(--accent-rose)", filter: "blur(120px)", opacity: 0.025 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <div className="reveal pill mb-6">
                <span className="pill-dot pill-dot--emerald" />
                Core Innovation
              </div>
              <h2
                className="reveal text-4xl md:text-5xl lg:text-6xl mb-8 leading-[1.05]"
                style={{ color: "var(--text-primary)", transitionDelay: "100ms" }}
              >
                Your Digital Self
                <br />
                <span className="italic font-normal" style={{ color: "var(--text-secondary)" }}>Evolves With You</span>
              </h2>
              <p
                className="reveal text-base md:text-lg max-w-md leading-relaxed mb-14"
                style={{ color: "var(--text-secondary)", transitionDelay: "200ms", fontWeight: 300, lineHeight: 1.75 }}
              >
                Every goal you set, every skill you learn, every opportunity you take — your Digital Self updates in real time.
                Three avatars represent different dimensions of your growth.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Knowledge Self", desc: "Learning & Skills", color: "var(--accent-primary)" },
                  { label: "Career Self", desc: "Projects & Growth", color: "var(--accent-warm)" },
                  { label: "Community Self", desc: "Networking & Events", color: "var(--accent-rose)" },
                ].map((item, i) => (
                  <div key={item.label} className="premium-card reveal" style={{ transitionDelay: `${i * 120 + 300}ms`, padding: "1.5rem 1rem" }}>
                    <div className="text-center">
                      <div
                        className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center text-sm font-bold"
                        style={{ background: item.color, color: "#fff", boxShadow: `0 0 20px ${item.color}33` }}
                      >
                        {item.label[0]}
                      </div>
                      <h4 className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{item.label}</h4>
                      <p className="text-[10px] tracking-wide uppercase font-medium" style={{ color: "var(--text-muted)" }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal flex items-center justify-center" style={{ transitionDelay: "300ms" }}>
              <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, var(--accent-primary), var(--accent-warm), var(--accent-rose), var(--accent-primary))",
                    filter: "blur(40px)",
                    opacity: 0.25,
                    animation: "spin 10s linear infinite",
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-4 rounded-full" style={{ background: "var(--bg-abyss)" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    N
                  </span>
                </div>
                {[
                  { label: "K", color: "var(--accent-primary)", x: 0, y: -130 },
                  { label: "C", color: "var(--accent-warm)", x: 112, y: 65 },
                  { label: "X", color: "var(--accent-rose)", x: -112, y: 65 },
                ].map((node) => (
                  <div
                    key={node.label}
                    className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: node.color,
                      color: "#fff",
                      left: `calc(50% + ${node.x}px - 16px)`,
                      top: `calc(50% + ${node.y}px - 16px)`,
                      boxShadow: `0 0 16px ${node.color}44`,
                    }}
                  >
                    {node.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES — ASYMMETRIC BENTO ── */}
      <section className="section">
        <div className="container">
          <div className="mb-20 max-w-2xl">
            <div className="reveal pill mb-6">
              <span className="pill-dot pill-dot--aurum" />
              Capabilities
            </div>
            <h2
              className="reveal text-4xl md:text-5xl lg:text-6xl mb-5 leading-[1.05]"
              style={{ color: "var(--text-primary)", transitionDelay: "100ms" }}
            >
              Everything You Need
              <br />
              <span className="italic font-normal" style={{ color: "var(--text-secondary)" }}>to Evolve</span>
            </h2>
            <p
              className="reveal text-base md:text-lg max-w-md leading-relaxed"
              style={{ color: "var(--text-secondary)", transitionDelay: "200ms", fontWeight: 300 }}
            >
              A complete platform for personal and professional growth, designed around your unique trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4" data-stagger>
            {features.map((f, i) => {
              const isWide = i === 0 || i === 3
              const cls = isWide ? "md:col-span-8" : "md:col-span-4"
              return (
                <div key={f.title} className={`${cls} premium-card`} onMouseMove={handleCardMouseMove}>
                  <div className="flex items-start gap-5">
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-lg"
                      style={{
                        background: `${f.color}18`,
                        color: f.color,
                        boxShadow: `0 0 24px ${f.color}15`,
                      }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="mb-20">
              <div className="reveal pill mb-6">
                <span className="pill-dot pill-dot--solar" />
                How It Works
              </div>
              <h2
                className="reveal text-4xl md:text-5xl lg:text-6xl leading-[1.05]"
                style={{ color: "var(--text-primary)", transitionDelay: "100ms" }}
              >
                Your Journey in
                <br />
                <span className="italic font-normal" style={{ color: "var(--text-secondary)" }}>Four Movements</span>
              </h2>
            </div>

            <div className="relative">
              <div
                className="absolute left-[19px] top-2 bottom-2 hidden md:block"
                style={{
                  width: "1px",
                  background: "linear-gradient(180deg, var(--accent-primary), var(--accent-warm), var(--accent-rose))",
                  opacity: 0.4,
                }}
              />

              <div className="space-y-14 md:space-y-16">
                {steps.map((step, i) => (
                  <div key={step.num} className="relative pl-0 md:pl-16 reveal" style={{ transitionDelay: `${i * 140}ms` }}>
                    <div
                      className="hidden md:flex absolute left-0 top-1 w-[39px] h-[39px] rounded-full items-center justify-center text-xs font-bold"
                      style={{
                        background: i % 2 === 0 ? "var(--accent-primary)" : "var(--accent-warm)",
                        color: "#fff",
                        boxShadow: i % 2 === 0 ? "0 0 20px var(--accent-primary-soft)" : "0 0 20px var(--accent-warm-soft)",
                      }}
                    >
                      {step.num}
                    </div>

                    <div className="premium-card">
                      <div className="flex items-start gap-4">
                        <span
                          className="md:hidden text-2xl font-bold shrink-0"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: i % 2 === 0 ? "var(--accent-primary)" : "var(--accent-warm)",
                          }}
                        >
                          {step.num}
                        </span>
                        <div>
                          <h3 className="text-lg md:text-xl mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="premium-card premium-card-elevated relative overflow-hidden" style={{ padding: "clamp(2rem, 5vw, 3.5rem)" }}>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: "var(--accent-primary)", filter: "blur(120px)", opacity: 0.05 }}
                aria-hidden="true"
              />
              <div className="relative z-10 text-center">
                <div className="reveal pill mb-8 inline-flex">
                  <span className="pill-dot pill-dot--cosmos" />
                  Begin
                </div>
                <h2
                  className="reveal text-4xl md:text-5xl lg:text-6xl mb-6 leading-[1.05]"
                  style={{ color: "var(--text-primary)", transitionDelay: "100ms" }}
                >
                  Ready to Start
                  <br />
                  <span className="italic font-normal" style={{ color: "var(--text-secondary)" }}>Your Evolution</span>
                  ?
                </h2>
                <p
                  className="reveal text-base md:text-lg max-w-md mx-auto leading-relaxed mb-10"
                  style={{ color: "var(--text-secondary)", transitionDelay: "200ms", fontWeight: 300 }}
                >
                  Join Nexus AI and build your future with a network of reasoning agents that learn, adapt, and grow with you.
                </p>
                <div className="reveal" style={{ transitionDelay: "300ms" }}>
                  <Link href="/auth/register" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1rem" }}>
                    Get Started Free
                    <span className="btn-icon">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs"
              style={{ background: "linear-gradient(135deg, var(--accent-warm), #d97706)", color: "var(--bg-abyss)" }}
            >
              N
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Nexus — Human Evolution Operating System
            </span>
          </div>
          <div className="text-[11px] tracking-wide" style={{ color: "var(--text-whisper)" }}>
            © 2026 Nexus AI
          </div>
        </div>
      </footer>
    </div>
  )
}
