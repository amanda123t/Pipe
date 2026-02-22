"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import type { Phase, Card } from "@/types";

interface KanbanColumnProps {
  phase: Phase & { _count?: { cards: number } };
  cards: Card[];
  onAddCard: () => void;
  onCardClick: (cardId: string) => void;
}

export function KanbanColumn({
  phase,
  cards,
  onAddCard,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: phase.id });

  return (
    <div className="kanban-column flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: phase.color }}
          />
          <h3 className="text-sm font-semibold text-gray-700">{phase.name}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddCard}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-2 transition-colors min-h-[100px]",
          isOver ? "bg-purple-50 border-2 border-purple-200" : "bg-gray-100/60"
        )}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card.id)}
              />
            ))}
          </div>
        </SortableContext>

        {cards.length === 0 && (
          <button
            onClick={onAddCard}
            className="w-full py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar card
          </button>
        )}
      </div>

      {/* Add Card Button */}
      {cards.length > 0 && (
        <button
          onClick={onAddCard}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar card
        </button>
      )}
    </div>
  );
}
