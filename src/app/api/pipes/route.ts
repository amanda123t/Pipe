import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    const pipes = await prisma.pipe.findMany({
      where: {
        organizationId: organizationId || undefined,
        organization: {
          members: {
            some: { userId: session.user.id },
          },
        },
      },
      include: {
        _count: {
          select: {
            cards: { where: { status: "ACTIVE" } },
            phases: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(pipes);
  } catch (error) {
    console.error("Get pipes error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, color, organizationId } = body;

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Nome e organização são obrigatórios" },
        { status: 400 }
      );
    }

    // Check membership
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const pipe = await prisma.pipe.create({
      data: {
        name,
        description,
        icon: icon || "📋",
        color: color || "#6B4EFF",
        organizationId,
        phases: {
          create: [
            { name: "Início", order: 0, color: "#64748B" },
            { name: "Em andamento", order: 1, color: "#3B82F6" },
            { name: "Concluído", order: 2, color: "#10B981", isDone: true },
          ],
        },
      },
      include: {
        phases: true,
        _count: {
          select: { cards: true, phases: true },
        },
      },
    });

    return NextResponse.json(pipe, { status: 201 });
  } catch (error) {
    console.error("Create pipe error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
