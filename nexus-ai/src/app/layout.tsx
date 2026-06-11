import type { Metadata } from "next"
import { Playfair_Display, DM_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Nexus AI — Human Evolution Operating System",
  description:
    "Don't ask AI for answers. Build your future with an AI that grows with you. Nexus AI is a Human Evolution Operating System powered by a network of reasoning agents.",
  keywords: ["AI", "personal growth", "learning", "career", "goals", "agents"],
  openGraph: {
    title: "Nexus AI — Human Evolution Operating System",
    description: "Don't ask AI for answers. Build your future with an AI that grows with you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus AI — Human Evolution Operating System",
    description: "Don't ask AI for answers. Build your future with an AI that grows with you.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
