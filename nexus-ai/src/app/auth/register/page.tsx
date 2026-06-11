"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"

function AmbientBackground() {
  return <div className="ambient-bg" aria-hidden="true" />
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Registration failed")
      setLoading(false)
      return
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push("/dashboard")
      router.refresh()
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-abyss)" }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 relative overflow-hidden" style={{ background: "var(--bg-abyss)" }}>
      <AmbientBackground />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 no-underline">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base"
              style={{
                background: "linear-gradient(135deg, var(--accent-aurum), #e8c547)",
                color: "var(--bg-abyss)",
                boxShadow: "0 0 24px var(--accent-aurum-soft)",
              }}
            >
              N
            </div>
          </Link>
          <h1
            className="text-3xl md:text-4xl mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
          >
            Begin your evolution
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
            Create your account and start growing
          </p>
        </div>

        <div className="doppel-card doppel-card-glass">
          <div className="doppel-card-inner">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="p-3.5 rounded-xl text-sm animate-fadeInDown"
                  style={{
                    background: "rgba(240, 104, 74, 0.08)",
                    border: "1px solid rgba(240, 104, 74, 0.2)",
                    color: "var(--accent-solar-light, #f89a7e)",
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.1em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                <p className="text-[11px] mt-2" style={{ color: "var(--text-whisper)" }}>
                  Minimum 8 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
                style={{ marginTop: "0.5rem" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner-sm" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold transition-colors"
            style={{ color: "var(--accent-aurum)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e8c547")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent-aurum)")}
          >
            Sign in
          </Link>
        </p>

        <p className="text-center mt-3">
          <Link
            href="/"
            className="text-xs transition-colors"
            style={{ color: "var(--text-whisper)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-whisper)")}
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
