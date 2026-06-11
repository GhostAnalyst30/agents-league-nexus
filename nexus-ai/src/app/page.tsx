"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

/* ───────────────────────────────────── */
/*  HOOKS                                */
/* ───────────────────────────────────── */

function useTypewriter(words: string[], typeSpeed = 65, deleteSpeed = 40, pauseMs = 2200) {
  const [text, setText] = useState("")
  const [wordIdx, setWordIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx] || ""
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting) {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), pauseMs)
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed)
      } else {
        setIsDeleting(false)
        setWordIdx((prev) => (prev + 1) % words.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [text, wordIdx, isDeleting, words, typeSpeed, deleteSpeed, pauseMs])

  return text
}

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible")
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    )

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) => observer.observe(el))

    document.querySelectorAll("[data-stagger]").forEach((container) => {
      const children = container.children
      const staggerObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            Array.from(children).forEach((child, i) => {
              setTimeout(() => (child as HTMLElement).classList.add("visible"), i * 100)
            })
            staggerObserver.unobserve(container)
          }
        },
        { threshold: 0.1 }
      )
      staggerObserver.observe(container)
    })

    return () => observer.disconnect()
  }, [])
}

/* ───────────────────────────────────── */
/*  SUB-COMPONENTS                        */
/* ───────────────────────────────────── */

function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="aurora-drift absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#c4a079]" style={{ filter: "blur(100px)", opacity: 0.025 }} />
      <div className="aurora-drift absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full bg-[#1a7a7a]" style={{ filter: "blur(90px)", opacity: 0.025, animationDelay: "4s" }} />
      <div className="fixed top-1/3 left-1/2 w-2 h-2 rounded-full bg-[#c4a079]" style={{ filter: "blur(2px)", opacity: 0.15 }} />
      <div className="fixed bottom-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-[#1a7a7a]" style={{ filter: "blur(2px)", opacity: 0.12 }} />
    </div>
  )
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
          const duration = 2200
          const steps = 35
          const increment = target / steps
          let current = 0
          const interval = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(interval)
            } else {
              setCount(Math.floor(current * 10 ** decimals) / 10 ** decimals)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, decimals])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

function DigitalSelfVisualizer() {
  return (
    <div className="relative w-[320px] h-[320px] mx-auto flex items-center justify-center">
      {/* Ghost ring glow */}
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 80px rgba(26, 122, 122, 0.06), 0 0 160px rgba(196, 160, 121, 0.04)" }} />

      {/* Outer ring */}
      <div className="orbit-slow absolute inset-0">
        <div className="w-full h-full rounded-full border border-[rgba(196,160,121,0.10)]" />
      </div>

      {/* Middle ring */}
      <div className="orbit-reverse absolute" style={{ inset: "18px" }}>
        <div className="w-full h-full rounded-full border border-[rgba(255,255,255,0.04)]" />
      </div>

      {/* Inner ring */}
      <div className="orbit-slow absolute" style={{ inset: "36px", animationDuration: "35s" }}>
        <div className="w-full h-full rounded-full border border-[rgba(196,160,121,0.06)]" />
      </div>

      {/* Orbiting avatars */}
      <div className="orbit-slow absolute inset-0" style={{ animationDuration: "25s" }}>
        {[
          { label: "K", bg: "linear-gradient(135deg, #1a7a7a, #2a9d9d)", angle: 0, distance: 135 },
          { label: "C", bg: "linear-gradient(135deg, #c4a079, #dcc5a8)", angle: 120, distance: 135 },
          { label: "O", bg: "linear-gradient(135deg, #c45a3a, #d87a5a)", angle: 240, distance: 135 },
        ].map((item) => {
          const rad = (item.angle * Math.PI) / 180
          const x = 160 + item.distance * Math.cos(rad) - 16
          const y = 160 + item.distance * Math.sin(rad) - 16
          return (
            <div
              key={item.label}
              className="orbit-reverse"
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 32,
                height: 32,
                borderRadius: "9999px",
                background: item.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "#ece4d9",
                animationDuration: "25s",
                boxShadow: "0 0 16px rgba(196, 160, 121, 0.15)",
              }}
            >
              {item.label}
            </div>
          )
        })}
      </div>

      {/* Orbiting particles */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i * 36 * Math.PI) / 180
        const dist = 60 + (i % 4) * 22
        const x = 160 + dist * Math.cos(angle) - 2
        const y = 160 + dist * Math.sin(angle) - 2
        return (
          <div
            key={i}
            className="orbit-slow"
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 3,
              height: 3,
              borderRadius: "9999px",
              background: i % 3 === 0 ? "#c4a079" : i % 3 === 1 ? "#1a7a7a" : "#c45a3a",
              opacity: 0.5,
              animationDuration: `${18 + (i % 5) * 3}s`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        )
      })}

      {/* Center core */}
      <div className="ds-orbit w-24 h-24 flex items-center justify-center">
        <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full bg-[#0c0b0a] flex items-center justify-center">
          <span className="text-2xl font-bold text-[#ece4d9]" style={{ fontFamily: "var(--font-display)" }}>N</span>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────────────── */
/*  DATA                                  */
/* ───────────────────────────────────── */

const agents = [
  { name: "Goal Analysis", role: "Detects goals, intentions & motivations", emoji: "🎯", activity: 92 },
  { name: "Skill Gap", role: "Identifies what you need to learn", emoji: "🔍", activity: 88 },
  { name: "Learning Path", role: "Creates personalized roadmaps", emoji: "🗺️", activity: 85 },
  { name: "Opportunity Matching", role: "Finds events, hackathons & more", emoji: "⚡", activity: 79 },
  { name: "Profile Evolution", role: "Tracks growth & updates Digital Self", emoji: "📈", activity: 91 },
  { name: "Future Simulation", role: "Simulates scenarios & outcomes", emoji: "🔮", activity: 76 },
]

const features = [
  { title: "Living Human Model", desc: "A continuously evolving Digital Self that grows with every action you take.", accent: "#1a7a7a" },
  { title: "Multi-Agent Reasoning", desc: "Six specialized agents working in orchestration to analyze and guide you.", accent: "#c4a079" },
  { title: "Personalized Roadmaps", desc: "Dynamic learning paths that adapt to your goals and your progress.", accent: "#c45a3a" },
  { title: "Opportunity Engine", desc: "Smart matching with events, hackathons, scholarships, and more.", accent: "#2a9d9d" },
  { title: "Future Simulation", desc: "Compare different paths to see success probabilities before you commit.", accent: "#dcc5a8" },
  { title: "Persistent Memory", desc: "Nexus remembers everything. Each conversation deepens its understanding.", accent: "#d87a5a" },
]

const howItWorks = [
  { num: "01", title: "Share Your Intention", desc: "Tell Nexus what you want to achieve. The system listens and builds your initial Digital Self model." },
  { num: "02", title: "Multi-Agent Analysis", desc: "Six reasoning agents analyze your goals, skills, gaps, and opportunities in parallel." },
  { num: "03", title: "Receive Your Roadmap", desc: "A personalized learning path with milestones, resources, and timelines appears." },
  { num: "04", title: "Grow, Then Repeat", desc: "Every action updates your Digital Self. The system adapts as you evolve." },
]

/* ───────────────────────────────────── */
/*  MAIN PAGE                             */
/* ───────────────────────────────────── */

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const [navScrolled, setNavScrolled] = useState(false)
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 })

  const typewriterText = useTypewriter([
    "your ambitions",
    "your potential",
    "your future",
    "what matters",
    "your growth",
    "beyond limits",
  ])

  useScrollReveal()

  useEffect(() => {
    setMounted(true)
    if (session) router.push("/dashboard")
  }, [session, router])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setParallaxOffset({ x: x * 15, y: y * 15 })
  }, [])

  if (!mounted) return null

  return (
    <div id="main-content" className="min-h-screen overflow-x-hidden">
      <BackgroundAtmosphere />

      {/* ── Nav Island ── */}
      <nav className={`nav-island ${navScrolled ? "scrolled" : ""}`}>
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0c0b0a] font-bold text-xs" style={{ background: "linear-gradient(135deg, #c4a079, #dcc5a8)" }}>N</div>
          <span className="font-medium text-sm text-[#ece4d9] tracking-tight">Nexus</span>
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          {session ? (
            <Link href="/dashboard" className="btn btn-primary text-xs" style={{ padding: "0.5rem 1rem" }}>
              Dashboard
              <span className="btn-arrow">→</span>
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost text-xs" style={{ padding: "0.375rem 0.875rem" }}>Sign In</Link>
              <Link href="/auth/register" className="btn btn-primary text-xs" style={{ padding: "0.375rem 0.875rem" }}>
                Get Started
                <span className="btn-arrow">→</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero (Asymmetric Editorial Split) ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[100dvh] flex items-center pt-28 pb-16 px-6 overflow-hidden"
      >
        {/* Parallax atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#c4a079]"
            style={{ filter: "blur(80px)", opacity: 0.025, transform: `translate(${parallaxOffset.x * 0.4}px, ${parallaxOffset.y * 0.4}px)`, transition: "transform 0.2s var(--ease-out-expo)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-[#1a7a7a]"
            style={{ filter: "blur(70px)", opacity: 0.03, transform: `translate(${parallaxOffset.x * -0.3}px, ${parallaxOffset.y * -0.3}px)`, transition: "transform 0.25s var(--ease-out-expo)" }}
          />
        </div>

        {/* Content grid — asymmetric 3/5 + 2/5 */}
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left — Editorial text block */}
            <div className="lg:col-span-7">
              <div className="reveal">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-[#a09888] mb-8" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a7a7a]" />
                  Human Evolution OS · v1.0
                </div>
              </div>

              <h1 className="reveal text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92] mb-6 text-balance" style={{ fontFamily: "var(--font-display)", fontWeight: 600, transitionDelay: "100ms" }}>
                <span className="text-[#ece4d9]">Don&apos;t just</span>
                <br />
                <span className="italic text-[#a09888]" style={{ fontWeight: 400 }}>ask for answers.</span>
                <br />
                <span className="text-[#ece4d9]">Build a future</span>
                <br />
                <span className="text-[#ece4d9]">with AI that</span>
                <br />
                <span className="inline-flex items-baseline" style={{ minHeight: "1.2em" }}>
                  <span className="text-[#c4a079]">{typewriterText}</span>
                  <span className="ml-1 font-light text-[#c4a079]" style={{ animation: "blink 0.8s step-end infinite" }}>|</span>
                </span>
              </h1>

              <p className="reveal text-base md:text-lg text-[#a09888] max-w-lg leading-relaxed mb-10" style={{ transitionDelay: "200ms", lineHeight: 1.7 }}>
                Nexus AI is not a chatbot. It&apos;s a network of reasoning agents that continuously learn who you are, what you want, and how to help you grow beyond your limits.
              </p>

              <div className="reveal flex flex-wrap items-center gap-4" style={{ transitionDelay: "300ms" }}>
                <Link href="/auth/register" className="btn btn-gold text-sm" style={{ padding: "0.875rem 2rem" }}>
                  Start Your Evolution
                  <span className="btn-arrow" style={{ background: "rgba(12, 11, 10, 0.2)" }}>→</span>
                </Link>
                <a href="#agents" className="btn btn-ghost text-sm" style={{ padding: "0.875rem 1.75rem" }}>Meet the Agents</a>
              </div>

              {/* Scroll teaser */}
              <div className="reveal flex items-center gap-3 mt-16" style={{ transitionDelay: "500ms" }}>
                <div className="h-8 w-px" style={{ background: "linear-gradient(180deg, var(--accent-teal), transparent)" }} />
                <span className="text-[10px] text-[#706858] tracking-[0.15em] uppercase">Scroll to explore</span>
              </div>
            </div>

            {/* Right — Visual */}
            <div className="lg:col-span-5 reveal-scale flex items-center justify-center" style={{ transitionDelay: "200ms" }}>
              <DigitalSelfVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
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
                <div className="text-4xl md:text-5xl font-bold text-[#ece4d9] mb-1 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  <StatCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-[#706858] tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="max-w-4xl mx-auto mt-10 divider-gradient" />
        </div>
      </section>

      {/* ── Agent Ecosystem (Editorial Cards) ── */}
      <section id="agents" className="section">
        <div className="container">
          <div className="mb-20 max-w-2xl">
            <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#706858] mb-6" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>Your Ecosystem</div>
            <h2 className="reveal text-4xl md:text-5xl mb-4 text-[#ece4d9] leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 600, transitionDelay: "100ms" }}>
              Your Personal<br />
              <span className="italic font-normal" style={{ color: "#a09888" }}>Agent Ecosystem</span>
            </h2>
            <p className="reveal text-[#a09888] text-lg max-w-md leading-relaxed" style={{ transitionDelay: "200ms", fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Six specialized reasoning agents working in orchestration to understand, analyze, and guide your personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
            {agents.map((agent) => (
              <div key={agent.name} className="card card-glow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{agent.emoji}</span>
                  <span className="text-xs font-mono text-[#706858]">{agent.activity}%</span>
                </div>
                <h3 className="text-[#ece4d9] font-medium text-base mb-1" style={{ fontFamily: "var(--font-body)" }}>{agent.name}</h3>
                <p className="text-[#706858] text-sm leading-relaxed mb-5">{agent.role}</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${agent.activity}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Digital Self — Immersive ── */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-[#c4a079]" style={{ filter: "blur(100px)", opacity: 0.02 }} />
        </div>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#706858] mb-6" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>Core Innovation</div>
              <h2 className="reveal text-4xl md:text-5xl mb-6 leading-[1.05] text-[#ece4d9]" style={{ fontFamily: "var(--font-display)", fontWeight: 600, transitionDelay: "100ms" }}>
                Your Digital Self<br />
                <span className="italic font-normal" style={{ color: "#a09888" }}>Evolves With You</span>
              </h2>
              <p className="reveal text-[#a09888] text-lg max-w-md leading-relaxed mb-12" style={{ transitionDelay: "200ms", fontWeight: 300 }}>
                Every goal you set, every skill you learn, every opportunity you take — your Digital Self updates in real time. Three avatars represent different dimensions of your growth.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Knowledge Self", desc: "Learning & Skills", bg: "linear-gradient(135deg, #1a7a7a, #2a9d9d)" },
                  { label: "Career Self", desc: "Projects & Growth", bg: "linear-gradient(135deg, #c4a079, #dcc5a8)" },
                  { label: "Community Self", desc: "Networking & Events", bg: "linear-gradient(135deg, #c45a3a, #d87a5a)" },
                ].map((item, i) => (
                  <div key={item.label} className="card reveal" style={{ transitionDelay: `${i * 100 + 300}ms`, padding: "1.25rem" }}>
                    <div className="text-center">
                      <div
                        className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center"
                        style={{ background: item.bg }}
                      >
                        <span className="text-sm font-semibold text-[#ece4d9]">{item.label[0]}</span>
                      </div>
                      <h4 className="text-sm font-medium text-[#ece4d9] mb-0.5">{item.label}</h4>
                      <p className="text-[10px] text-[#706858] tracking-wide uppercase">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal-scale flex items-center justify-center" style={{ transitionDelay: "400ms" }}>
              <DigitalSelfVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (Magazine-Style Asymmetric Grid) ── */}
      <section className="section">
        <div className="container">
          <div className="mb-20 max-w-2xl">
            <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#706858] mb-6" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>Capabilities</div>
            <h2 className="reveal text-4xl md:text-5xl mb-4 text-[#ece4d9] leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 600, transitionDelay: "100ms" }}>
              Everything You Need<br />
              <span className="italic font-normal" style={{ color: "#a09888" }}>to Evolve</span>
            </h2>
            <p className="reveal text-[#a09888] text-lg max-w-md leading-relaxed" style={{ transitionDelay: "200ms", fontWeight: 300 }}>
              A complete platform for personal and professional growth, designed around your unique trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-stagger>
            {features.map((f, i) => {
              const isWide = i === 0 || i === 3
              return (
                <div
                  key={f.title}
                  className={`card card-glow ${isWide ? "md:col-span-2" : ""}`}
                  style={{ position: "relative" }}
                >
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-[var(--radius-md)]"
                    style={{ background: `linear-gradient(180deg, ${f.accent}, transparent)` }}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg float-medium"
                      style={{ background: `${f.accent}15` }}
                    >
                      {["🧬", "🧠", "🗺️", "⚡", "🔮", "💭"][i]}
                    </div>
                    <div>
                      <h3 className="text-[#ece4d9] font-medium text-base mb-1">{f.title}</h3>
                      <p className="text-[#706858] text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works (Timeline) ── */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="mb-20">
              <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#706858] mb-6" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>How It Works</div>
              <h2 className="reveal text-4xl md:text-5xl text-[#ece4d9] leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 600, transitionDelay: "100ms" }}>
                Your Journey in<br />
                <span className="italic font-normal" style={{ color: "#a09888" }}>Four Movements</span>
              </h2>
            </div>

            <div className="relative">
              {/* Timeline track */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px timeline-track" style={{ width: "1px", opacity: 0.5 }} />

              <div className="space-y-16">
                {howItWorks.map((step, i) => (
                  <div key={step.num} className="relative pl-14 reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                    {/* Number dot */}
                    <div
                      className="absolute left-0 top-1 w-[39px] h-[39px] rounded-full flex items-center justify-center text-xs font-semibold text-[#0c0b0a]"
                      style={{ background: i % 2 === 0 ? "#c4a079" : "#1a7a7a" }}
                    >
                      {step.num}
                    </div>

                    <div className="card" style={{ padding: "1.5rem 2rem" }}>
                      <h3 className="text-lg text-[#ece4d9] mb-1.5" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{step.title}</h3>
                      <p className="text-sm text-[#706858] leading-relaxed">{step.desc}</p>
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
          <div className="max-w-2xl mx-auto text-center">
            <div className="card" style={{ padding: "3.5rem 2.5rem", position: "relative", overflow: "hidden", border: "1px solid rgba(196, 160, 121, 0.12)" }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#c4a079]" style={{ filter: "blur(90px)", opacity: 0.025, pointerEvents: "none" }} />
              <div className="relative z-10">
                <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#706858] mb-6" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>Begin</div>
                <h2 className="reveal text-4xl md:text-5xl text-[#ece4d9] mb-4 leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 600, transitionDelay: "100ms" }}>
                  Ready to Start<br />
                  <span className="italic font-normal" style={{ color: "#a09888" }}>Your Evolution</span>?
                </h2>
                <p className="reveal text-[#a09888] text-base max-w-sm mx-auto leading-relaxed mb-10" style={{ transitionDelay: "200ms", fontWeight: 300 }}>
                  Join Nexus AI and build your future with a network of reasoning agents that learn, adapt, and grow with you.
                </p>
                <div className="reveal" style={{ transitionDelay: "300ms" }}>
                  <Link href="/auth/register" className="btn btn-gold text-sm" style={{ padding: "1rem 2.5rem" }}>
                    Get Started Free
                    <span className="btn-arrow" style={{ background: "rgba(12, 11, 10, 0.2)" }}>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
        <div className="container flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[#0c0b0a] font-bold text-xs" style={{ background: "linear-gradient(135deg, #c4a079, #dcc5a8)" }}>N</div>
            <span className="text-xs text-[#706858]">Nexus — Human Evolution Operating System</span>
          </div>
          <div className="text-xs text-[#504840]">&copy; 2026 Nexus AI</div>
        </div>
      </footer>
    </div>
  )
}
