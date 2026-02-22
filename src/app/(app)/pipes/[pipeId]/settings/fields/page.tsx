import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FieldsSettingsClient } from "@/components/pipes/fields-settings-client";

export default async function FieldsSettingsPage({
  params,
}: {
  params: { pipeId: string };
}) {
  const session = await getServerSession(authOptions);

  const pipe = await prisma.pipe.findUnique({
    where: { id: params.pipeId },
    include: {
      fields: { orderBy: { order: "asc" } },
      phases: { orderBy: { order: "asc" } },
    },
  });

  if (!pipe) notFound();

  return <FieldsSettingsClient pipe={pipe} />;
}
