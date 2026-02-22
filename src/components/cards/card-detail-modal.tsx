"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  AlertCircle,
  MessageSquare,
  Clock,
  Tag,
  User,
  Loader2,
  Trash2,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  cn,
  formatDate,
  formatDateTime,
  timeAgo,
  getPriorityColor,
  getPriorityLabel,
  getInitials,
} from "@/lib/utils";
import type { Card, Pipe } from "@/types";

interface CardDetailModalProps {
  cardId: string;
  pipe: Pipe;
  onClose: () => void;
  onUpdated: (card: Card) => void;
  onDeleted: (cardId: string) => void;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function CardDetailModal({
  cardId,
  pipe,
  onClose,
  onUpdated,
  onDeleted,
}: CardDetailModalProps) {
  const { toast } = useToast();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  const fetchCard = async () => {
    try {
      const res = await fetch(`/api/cards/${cardId}`);
      if (res.ok) {
        const data = await res.json();
        setCard(data);
        setNewTitle(data.title);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCard = async (updates: Partial<Card>) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setCard((prev) => ({ ...prev!, ...updated }));
        onUpdated(updated);
      }
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleSaveTitle = async () => {
    if (newTitle.trim() && newTitle !== card?.title) {
      await updateCard({ title: newTitle.trim() } as Partial<Card>);
    }
    setEditingTitle(false);
  };

  const handleMoveToPhase = async (phaseId: string) => {
    await updateCard({ phaseId } as Partial<Card>);
    toast({ title: "Card movido!" });
  };

  const handlePriorityChange = async (priority: string) => {
    await updateCard({ priority } as Partial<Card>);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setCard((prev) =>
          prev
            ? { ...prev, comments: [...(prev.comments || []), newComment] }
            : prev
        );
        setComment("");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este card?")) return;

    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted(cardId);
      onClose();
      toast({ title: "Card excluído" });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-12">
          <Loader2 className="w-8 h-8 animate-spin text-pipe-purple" />
        </div>
      </div>
    );
  }

  if (!card) return null;

  const currentPhase = pipe.phases?.find((p) => p.id === card.phaseId);
  const isOverdue =
    card.dueDate && new Date(card.dueDate) < new Date() && card.status !== "DONE";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl mx-0 sm:mx-4 max-h-[90vh] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b">
          <div className="flex-1">
            {editingTitle ? (
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                autoFocus
                className="text-lg font-semibold"
              />
            ) : (
              <h2
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-pipe-purple transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {card.title}
              </h2>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
              <span>{pipe.name}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span
                className="font-medium"
                style={{ color: currentPhase?.color }}
              >
                {currentPhase?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Excluir card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors -mb-px",
              activeTab === "details"
                ? "text-pipe-purple border-b-2 border-pipe-purple"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors -mb-px",
              activeTab === "activity"
                ? "text-pipe-purple border-b-2 border-pipe-purple"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Atividade ({card.comments?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "details" ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Main */}
              <div className="sm:col-span-2 space-y-5">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </h3>
                  <textarea
                    value={card.description || ""}
                    onChange={(e) =>
                      setCard((prev) =>
                        prev ? { ...prev, description: e.target.value } : prev
                      )
                    }
                    onBlur={(e) =>
                      updateCard({ description: e.target.value } as Partial<Card>)
                    }
                    placeholder="Adicione uma descrição..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>

                {/* Custom Fields */}
                {card.fieldValues && card.fieldValues.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Campos
                    </h3>
                    <div className="space-y-3">
                      {card.fieldValues.map((fv) => (
                        <div key={fv.id}>
                          <label className="text-xs text-gray-500 mb-1 block">
                            {fv.field?.label}
                          </label>
                          <Input
                            value={fv.value || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCard((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      fieldValues: prev.fieldValues?.map((f) =>
                                        f.id === fv.id
                                          ? { ...f, value: newVal }
                                          : f
                                      ),
                                    }
                                  : prev
                              );
                            }}
                            placeholder={`Digite ${fv.field?.label}...`}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Move to phase */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Fase
                  </h3>
                  <select
                    value={card.phaseId}
                    onChange={(e) => handleMoveToPhase(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {pipe.phases?.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Prioridade
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePriorityChange(p)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                          card.priority === p
                            ? getPriorityColor(p) + " ring-2 ring-offset-1 ring-current"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {getPriorityLabel(p)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Prazo
                  </h3>
                  <Input
                    type="date"
                    value={
                      card.dueDate
                        ? new Date(card.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateCard({ dueDate: e.target.value ? new Date(e.target.value) : null } as Partial<Card>)
                    }
                    className={cn(
                      "h-8 text-sm",
                      isOverdue && "border-red-300 text-red-500"
                    )}
                  />
                  {isOverdue && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Atrasado
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Criado {timeAgo(card.createdAt)}</span>
                    </div>
                    {card.createdBy && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        <span>Por {card.createdBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {/* Comments */}
              {card.comments && card.comments.length > 0 ? (
                <div className="space-y-4">
                  {card.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-pipe-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(comment.author?.name || "?")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author?.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum comentário ainda</p>
                </div>
              )}

              {/* Add comment */}
              <form onSubmit={handleSubmitComment} className="flex gap-2 pt-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Adicionar comentário..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!comment.trim() || submittingComment}
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
