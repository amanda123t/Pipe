import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const card = await prisma.card.findUnique({
      where: { id: params.cardId },
      include: {
        phase: true,
        createdBy: { select: { id: true, name: true, avatar: true } },
        assignees: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        fieldValues: {
          include: { field: true },
          orderBy: { field: { order: "asc" } },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        attachments: { orderBy: { createdAt: "desc" } },
        labels: { include: { label: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card não encontrado" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Get card error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { phaseId, title, description, priority, dueDate, status, order } = body;

    const oldCard = await prisma.card.findUnique({
      where: { id: params.cardId },
      select: { phaseId: true, title: true },
    });

    const card = await prisma.card.update({
      where: { id: params.cardId },
      data: {
        ...(phaseId !== undefined && { phaseId }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status !== undefined && { status }),
        ...(order !== undefined && { order }),
      },
      include: {
        assignees: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        labels: { include: { label: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    // Log activity if phase changed
    if (phaseId && oldCard?.phaseId !== phaseId) {
      const [oldPhase, newPhase] = await Promise.all([
        prisma.phase.findUnique({ where: { id: oldCard!.phaseId }, select: { name: true } }),
        prisma.phase.findUnique({ where: { id: phaseId }, select: { name: true } }),
      ]);

      await prisma.activity.create({
        data: {
          type: "CARD_MOVED",
          cardId: params.cardId,
          userId: session.user.id,
          data: JSON.stringify({
            fromPhase: oldPhase?.name,
            toPhase: newPhase?.name,
          }),
        },
      });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Update card error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.card.delete({ where: { id: params.cardId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete card error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
