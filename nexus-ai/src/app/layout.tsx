import type { Metadata } from "next"
import { Playfair_Display, Outfit } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
})

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Nexus AI — Human Evolution Operating System",
  description:
    "Don't ask AI for answers. Build your future with an AI that grows with you. Nexus AI is a Human Evolution Operating System powered by a network of reasoning agents.",
  keywords: ["AI", "personal growth", "learning", "career", "goals", "agents"],
  openGraph: {
    title: "Nexus AI — Human Evolution Operating System",
    description:
      "Don't ask AI for answers. Build your future with an AI that grows with you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus AI — Human Evolution Operating System",
    description:
      "Don't ask AI for answers. Build your future with an AI that grows with you.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
