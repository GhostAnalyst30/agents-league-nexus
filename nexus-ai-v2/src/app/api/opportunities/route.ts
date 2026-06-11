import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      connections: {
        where: { userId: session.user.id },
        select: { id: true, status: true },
      },
    },
  });

  return NextResponse.json(opportunities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, type, url } = await req.json();

  const opportunity = await prisma.opportunity.create({
    data: { title, description, type, url, createdBy: session.user.id },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
