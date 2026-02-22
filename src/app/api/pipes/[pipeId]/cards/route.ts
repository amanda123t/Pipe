import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { pipeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get("phaseId");

    const cards = await prisma.card.findMany({
      where: {
        pipeId: params.pipeId,
        phaseId: phaseId || undefined,
        status: { not: "ARCHIVED" },
      },
      include: {
        assignees: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        labels: { include: { label: true } },
        _count: { select: { comments: true, attachments: true } },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Get cards error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

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
    const { title, description, phaseId, priority, dueDate } = body;

    if (!title || !phaseId) {
      return NextResponse.json(
        { error: "Título e fase são obrigatórios" },
        { status: 400 }
      );
    }

    // Get max order in phase
    const maxOrderCard = await prisma.card.findFirst({
      where: { phaseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const card = await prisma.card.create({
      data: {
        title,
        description,
        phaseId,
        pipeId: params.pipeId,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        order: (maxOrderCard?.order ?? -1) + 1,
        createdById: session.user.id,
      },
      include: {
        assignees: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        labels: { include: { label: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: "CARD_CREATED",
        cardId: card.id,
        userId: session.user.id,
        data: JSON.stringify({ title }),
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Create card error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
