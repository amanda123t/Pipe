"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Settings, LayoutList, Filter, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "@/components/pipes/kanban-column";
import { KanbanCard } from "@/components/pipes/kanban-card";
import { CreateCardDialog } from "@/components/cards/create-card-dialog";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { CreatePhaseDialog } from "@/components/pipes/create-phase-dialog";
import Link from "next/link";
import type { Pipe, KanbanPhase, Card } from "@/types";

type KanbanPipe = Pipe & { phases: KanbanPhase[] };

interface KanbanBoardProps {
  pipe: KanbanPipe;
  userId: string;
}

export function KanbanBoard({ pipe, userId }: KanbanBoardProps) {
  const [phases, setPhases] = useState<KanbanPhase[]>(pipe.phases);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreatePhase, setShowCreatePhase] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const findCardAndPhase = (cardId: string) => {
    for (const phase of phases) {
      const card = phase.cards.find((c) => c.id === cardId);
      if (card) return { card, phase };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const result = findCardAndPhase(active.id as string);
    if (result) {
      setActiveCard(result.card);
      setActivePhase(result.phase.id);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source phase
    const activeResult = findCardAndPhase(activeId);
    if (!activeResult) return;

    const sourcePhaseId = activeResult.phase.id;

    // Determine target phase
    let targetPhaseId = overId;
    if (!phases.find((p) => p.id === overId)) {
      // Over is a card, find its phase
      const overResult = findCardAndPhase(overId);
      if (overResult) {
        targetPhaseId = overResult.phase.id;
      }
    }

    if (sourcePhaseId === targetPhaseId) return;

    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id === sourcePhaseId) {
          return {
            ...phase,
            cards: phase.cards.filter((c) => c.id !== activeId),
          };
        }
        if (phase.id === targetPhaseId) {
          return {
            ...phase,
            cards: [...phase.cards, { ...activeResult.card, phaseId: targetPhaseId }],
          };
        }
        return phase;
      })
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setActivePhase(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find current phase of the card
    const result = findCardAndPhase(activeId);
    if (!result) return;

    const newPhaseId = result.phase.id;

    // Persist to DB
    try {
      await fetch(`/api/cards/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phaseId: newPhaseId }),
      });
    } catch (error) {
      console.error("Error moving card:", error);
    }
  };

  const handleCreateCard = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setShowCreateCard(true);
  };

  const handleCardCreated = (card: Card) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === card.phaseId
          ? { ...phase, cards: [...phase.cards, card] }
          : phase
      )
    );
  };

  const handlePhaseCreated = (phase: KanbanPhase) => {
    setPhases((prev) => [...prev, { ...phase, cards: [] }]);
  };

  const handleCardUpdated = (updatedCard: Card) => {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        cards: phase.cards.map((c) =>
          c.id === updatedCard.id ? { ...c, ...updatedCard } : c
        ),
      }))
    );
  };

  const handleCardDeleted = (cardId: string) => {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        cards: phase.cards.filter((c) => c.id !== cardId),
      }))
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Pipe Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${pipe.color}20` }}
            >
              {pipe.icon || "📋"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{pipe.name}</h1>
              {pipe.description && (
                <p className="text-sm text-gray-500">{pipe.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtrar</span>
            </button>
            <Link
              href={`/pipes/${pipe.id}/settings/fields`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Configurar</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          <button className="px-3 py-1.5 text-sm font-medium text-pipe-purple bg-purple-50 rounded-lg">
            Kanban
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            Lista
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Automações
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            <SortableContext
              items={phases.map((p) => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              {phases.map((phase) => (
                <KanbanColumn
                  key={phase.id}
                  phase={phase}
                  cards={phase.cards}
                  onAddCard={() => handleCreateCard(phase.id)}
                  onCardClick={(cardId) => setSelectedCardId(cardId)}
                />
              ))}
            </SortableContext>

            {/* Add Phase */}
            <div className="min-w-[280px]">
              <button
                onClick={() => setShowCreatePhase(true)}
                className="w-full flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-gray-600 hover:bg-white border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Adicionar fase</span>
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-2 opacity-90">
                <KanbanCard
                  card={activeCard}
                  isDragging
                  onClick={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showCreateCard && (
        <CreateCardDialog
          pipeId={pipe.id}
          phaseId={selectedPhaseId}
          onClose={() => setShowCreateCard(false)}
          onCreated={handleCardCreated}
        />
      )}

      {showCreatePhase && (
        <CreatePhaseDialog
          pipeId={pipe.id}
          onClose={() => setShowCreatePhase(false)}
          onCreated={handlePhaseCreated}
        />
      )}

      {selectedCardId && (
        <CardDetailModal
          cardId={selectedCardId}
          pipe={pipe}
          onClose={() => setSelectedCardId(null)}
          onUpdated={handleCardUpdated}
          onDeleted={handleCardDeleted}
        />
      )}
    </div>
  );
}
