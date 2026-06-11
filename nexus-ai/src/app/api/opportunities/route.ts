import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  return NextResponse.json(opportunities)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can create opportunities" }, { status: 403 })
  }

  const { title, description, type, url, matchScore, matchReason } = await req.json()
  const opportunity = await prisma.opportunity.create({
    data: { title, description, type, url, matchScore, matchReason, createdBy: session.user.id },
  })
  return NextResponse.json(opportunity)
}
