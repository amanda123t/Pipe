"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Kanban,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePipeDialog } from "@/components/pipes/create-pipe-dialog";
import { cn, formatDate } from "@/lib/utils";
import type { Organization, Pipe } from "@/types";

interface DashboardClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  organizations: Organization[];
  pipes: Pipe[];
  stats: {
    activeCards: number;
    completedCards: number;
    overdueCards: number;
    totalPipes: number;
  };
}

export function DashboardClient({
  user,
  organizations,
  pipes,
  stats,
}: DashboardClientProps) {
  const [showCreatePipe, setShowCreatePipe] = useState(false);
  const [localPipes, setLocalPipes] = useState(pipes);
  const defaultOrg = organizations[0];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const statCards = [
    {
      label: "Pipes Ativos",
      value: stats.totalPipes,
      icon: Workflow,
      color: "text-purple-600 bg-purple-50",
      trend: null,
    },
    {
      label: "Cards Ativos",
      value: stats.activeCards,
      icon: Kanban,
      color: "text-blue-600 bg-blue-50",
      trend: null,
    },
    {
      label: "Concluídos",
      value: stats.completedCards,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
      trend: null,
    },
    {
      label: "Atrasados",
      value: stats.overdueCards,
      icon: AlertCircle,
      color: stats.overdueCards > 0 ? "text-red-600 bg-red-50" : "text-gray-400 bg-gray-50",
      trend: null,
    },
  ];

  const handlePipeCreated = (newPipe: Pipe) => {
    setLocalPipes((prev) => [...prev, newPipe]);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Aqui está o resumo dos seus processos
          </p>
        </div>
        <Button
          onClick={() => setShowCreatePipe(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Pipe
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={cn("p-2 rounded-lg", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipes Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Seus Pipes</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreatePipe(true)}
            className="text-pipe-purple"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {localPipes.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Workflow className="w-8 h-8 text-pipe-purple" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Crie seu primeiro Pipe
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Pipes são fluxos de trabalho que ajudam você a gerenciar processos
              do início ao fim.
            </p>
            <Button onClick={() => setShowCreatePipe(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Pipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localPipes.map((pipe) => (
              <Link key={pipe.id} href={`/pipes/${pipe.id}/kanban`}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${pipe.color}20` }}
                      >
                        {pipe.icon || "📋"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-pipe-purple transition-colors">
                          {pipe.name}
                        </h3>
                        {pipe.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {pipe.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-pipe-purple transition-colors mt-1" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Kanban className="w-4 h-4" />
                      <span>{pipe._count?.cards ?? 0} cards</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(pipe.createdAt)}</span>
                    </div>
                  </div>

                  {/* Color bar */}
                  <div className="mt-4 h-1 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "60%",
                        backgroundColor: pipe.color,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}

            {/* Add new pipe card */}
            <button
              onClick={() => setShowCreatePipe(true)}
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-pipe-purple hover:bg-purple-50/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-gray-400 hover:text-pipe-purple"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Novo Pipe</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick tips */}
      {localPipes.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Dica: Adicione automações
              </h3>
              <p className="text-purple-100 text-sm">
                Configure regras automáticas para mover cards, enviar notificações e muito mais.
              </p>
            </div>
            <Link href={`/pipes/${localPipes[0]?.id}/kanban`}>
              <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
                Explorar
              </Button>
            </Link>
          </div>
        </div>
      )}

      {showCreatePipe && defaultOrg && (
        <CreatePipeDialog
          organizationId={defaultOrg.id}
          onClose={() => setShowCreatePipe(false)}
          onCreated={handlePipeCreated}
        />
      )}
    </div>
  );
}
