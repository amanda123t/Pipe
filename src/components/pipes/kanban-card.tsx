"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MessageSquare,
  Paperclip,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn, formatDate, getPriorityColor, getPriorityLabel, getInitials } from "@/lib/utils";
import type { Card } from "@/types";

interface KanbanCardProps {
  card: Card;
  isDragging?: boolean;
  onClick: () => void;
}

export function KanbanCard({ card, isDragging, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    card.dueDate && new Date(card.dueDate) < new Date() && card.status !== "DONE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "kanban-card group",
        isSortableDragging && "opacity-40",
        isDragging && "shadow-xl"
      )}
    >
      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map(({ label }) =>
            label ? (
              <span
                key={label.id}
                className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 leading-snug mb-2">
        {card.title}
      </p>

      {/* Priority Badge */}
      {card.priority !== "MEDIUM" && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mb-2",
            getPriorityColor(card.priority)
          )}
        >
          {card.priority === "URGENT" && (
            <AlertCircle className="w-3 h-3" />
          )}
          {getPriorityLabel(card.priority)}
        </span>
      )}

      {/* Due Date */}
      {card.dueDate && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs mb-2",
            isOverdue ? "text-red-500" : "text-gray-400"
          )}
        >
          <Calendar className="w-3 h-3" />
          <span>{formatDate(card.dueDate)}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        {/* Assignees */}
        <div className="flex -space-x-1.5">
          {card.assignees?.slice(0, 3).map(({ user }) =>
            user ? (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full bg-pipe-purple border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                title={user.name}
              >
                {getInitials(user.name)}
              </div>
            ) : null
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-gray-300 text-xs">
          {card._count?.comments !== undefined && card._count.comments > 0 && (
            <div className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" />
              <span>{card._count.comments}</span>
            </div>
          )}
          {card._count?.attachments !== undefined &&
            card._count.attachments > 0 && (
              <div className="flex items-center gap-0.5">
                <Paperclip className="w-3 h-3" />
                <span>{card._count.attachments}</span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
