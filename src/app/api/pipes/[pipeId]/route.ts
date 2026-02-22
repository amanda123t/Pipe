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

    const pipe = await prisma.pipe.findUnique({
      where: { id: params.pipeId },
      include: {
        phases: {
          orderBy: { order: "asc" },
          include: {
            _count: { select: { cards: { where: { status: "ACTIVE" } } } },
          },
        },
        fields: { orderBy: { order: "asc" } },
        _count: { select: { cards: true } },
      },
    });

    if (!pipe) {
      return NextResponse.json({ error: "Pipe não encontrado" }, { status: 404 });
    }

    return NextResponse.json(pipe);
  } catch (error) {
    console.error("Get pipe error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { pipeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const pipe = await prisma.pipe.update({
      where: { id: params.pipeId },
      data: body,
    });

    return NextResponse.json(pipe);
  } catch (error) {
    console.error("Update pipe error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pipeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.pipe.delete({ where: { id: params.pipeId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete pipe error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
