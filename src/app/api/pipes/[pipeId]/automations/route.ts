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

    const automations = await prisma.automation.findMany({
      where: { pipeId: params.pipeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(automations);
  } catch (error) {
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
    const { name, trigger, conditions, actions } = body;

    const automation = await prisma.automation.create({
      data: {
        name,
        trigger,
        conditions: conditions ? JSON.stringify(conditions) : null,
        actions: JSON.stringify(actions),
        pipeId: params.pipeId,
      },
    });

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error("Create automation error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
