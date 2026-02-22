import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/pipes/kanban-board";

export default async function KanbanPage({
  params,
}: {
  params: { pipeId: string };
}) {
  const session = await getServerSession(authOptions);

  const pipe = await prisma.pipe.findUnique({
    where: { id: params.pipeId },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            where: { status: { not: "ARCHIVED" } },
            orderBy: { order: "asc" },
            include: {
              assignees: {
                include: {
                  user: { select: { id: true, name: true, avatar: true } },
                },
              },
              labels: { include: { label: true } },
              _count: { select: { comments: true, attachments: true } },
            },
          },
          _count: {
            select: { cards: { where: { status: { not: "ARCHIVED" } } } },
          },
        },
      },
      fields: { orderBy: { order: "asc" } },
    },
  });

  if (!pipe) notFound();

  return <KanbanBoard pipe={pipe} userId={session!.user.id} />;
}
