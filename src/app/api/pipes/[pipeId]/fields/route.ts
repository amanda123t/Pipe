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

    const fields = await prisma.field.findMany({
      where: { pipeId: params.pipeId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(fields);
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
    const { label, type, required, description, options } = body;

    const maxOrderField = await prisma.field.findFirst({
      where: { pipeId: params.pipeId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const field = await prisma.field.create({
      data: {
        label,
        type,
        required: required || false,
        description,
        options: options ? JSON.stringify(options) : null,
        order: (maxOrderField?.order ?? -1) + 1,
        pipeId: params.pipeId,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error("Create field error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
