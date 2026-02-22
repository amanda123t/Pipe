import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { pipeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, isDone } = body;

    const maxOrderPhase = await prisma.phase.findFirst({
      where: { pipeId: params.pipeId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const phase = await prisma.phase.create({
      data: {
        name,
        color: color || "#64748B",
        isDone: isDone || false,
        order: (maxOrderPhase?.order ?? -1) + 1,
        pipeId: params.pipeId,
      },
      include: {
        _count: { select: { cards: true } },
      },
    });

    return NextResponse.json(phase, { status: 201 });
  } catch (error) {
    console.error("Create phase error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
