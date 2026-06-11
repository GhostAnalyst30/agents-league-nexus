import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roadmaps = await prisma.roadmap.findMany({
    where: { userId: session.user.id },
    include: { milestones: { orderBy: { order: "asc" } }, goal: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(roadmaps)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description, goalId, milestones } = await req.json()

  const roadmap = await prisma.roadmap.create({
    data: {
      userId: session.user.id,
      title,
      description,
      goalId,
      milestones: {
        create: (milestones || []).map((m: { title: string; order: number }) => ({
          title: m.title,
          order: m.order,
        })),
      },
    },
    include: { milestones: { orderBy: { order: "asc" } } },
  })
  return NextResponse.json(roadmap)
}
