import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, organizationName } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-mail já está em uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create default organization
    const orgName = organizationName || `${name}'s Workspace`;
    let slug = generateSlug(orgName);

    // Ensure unique slug
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      slug = `${slug}-${Date.now()}`;
    }

    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Create a sample pipe
    const pipe = await prisma.pipe.create({
      data: {
        name: "Vendas",
        description: "Pipeline de vendas e oportunidades",
        icon: "💼",
        color: "#6B4EFF",
        organizationId: organization.id,
        phases: {
          create: [
            { name: "Lead", order: 0, color: "#64748B" },
            { name: "Qualificação", order: 1, color: "#3B82F6" },
            { name: "Proposta", order: 2, color: "#F59E0B" },
            { name: "Negociação", order: 3, color: "#8B5CF6" },
            { name: "Fechado", order: 4, color: "#10B981", isDone: true },
          ],
        },
        fields: {
          create: [
            { label: "Empresa", type: "SHORT_TEXT", order: 0 },
            { label: "Valor", type: "NUMBER", order: 1 },
            { label: "Telefone", type: "PHONE", order: 2 },
            { label: "E-mail", type: "EMAIL", order: 3 },
            {
              label: "Origem",
              type: "SELECT",
              order: 4,
              options: JSON.stringify(["Indicação", "Google", "LinkedIn", "Site", "Evento"]),
            },
          ],
        },
      },
    });

    // Add sample cards
    const phases = await prisma.phase.findMany({
      where: { pipeId: pipe.id },
      orderBy: { order: "asc" },
    });

    if (phases.length > 0) {
      await prisma.card.create({
        data: {
          title: "Acme Corp - Software ERP",
          description: "Oportunidade de venda de sistema ERP",
          priority: "HIGH",
          order: 0,
          pipeId: pipe.id,
          phaseId: phases[0].id,
          createdById: user.id,
        },
      });
    }

    return NextResponse.json(
      { message: "Conta criada com sucesso", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
