import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const digitalSelf = await prisma.digitalSelf.findUnique({
    where: { userId: session.user.id },
  })

  if (!digitalSelf) {
    return NextResponse.json({
      knowledgeScore: 0,
      careerScore: 0,
      opportunityScore: 0,
      confidenceScore: 0,
      consistencyScore: 0,
      growthScore: 0,
    })
  }

  return NextResponse.json(digitalSelf)
}
