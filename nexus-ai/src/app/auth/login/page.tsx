"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-deep)" }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0c0b0a] font-bold text-sm" style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
              N
            </div>
            <span className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Nexus AI</span>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Sign in to continue your evolution</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg" style={{ background: "rgba(196, 90, 58, 0.1)", border: "1px solid rgba(196, 90, 58, 0.2)", color: "var(--accent-ember)" }}>
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none transition-colors"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              placeholder="you@example.com"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent-teal)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none transition-colors"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              placeholder="••••••••"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent-teal)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent-teal)", color: "var(--text-primary)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="transition-colors" style={{ color: "var(--accent-gold)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
