import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const organizations = await prisma.organization.findMany({
    where: {
      members: { some: { userId: session!.user.id } },
    },
    include: {
      pipes: {
        include: {
          _count: {
            select: {
              cards: { where: { status: "ACTIVE" } },
              phases: true,
            },
          },
        },
      },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
    },
  });

  const allPipes = organizations.flatMap((org) => org.pipes);

  const stats = await prisma.$transaction([
    prisma.card.count({
      where: {
        pipe: {
          organization: {
            members: { some: { userId: session!.user.id } },
          },
        },
        status: "ACTIVE",
      },
    }),
    prisma.card.count({
      where: {
        pipe: {
          organization: {
            members: { some: { userId: session!.user.id } },
          },
        },
        status: "DONE",
      },
    }),
    prisma.card.count({
      where: {
        pipe: {
          organization: {
            members: { some: { userId: session!.user.id } },
          },
        },
        dueDate: { lt: new Date() },
        status: { not: "DONE" },
      },
    }),
  ]);

  return (
    <DashboardClient
      user={session!.user}
      organizations={organizations as any}
      pipes={allPipes as any}
      stats={{
        activeCards: stats[0],
        completedCards: stats[1],
        overdueCards: stats[2],
        totalPipes: allPipes.length,
      }}
    />
  );
}
