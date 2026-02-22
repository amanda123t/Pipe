"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import type { Card } from "@/types";

interface CreateCardDialogProps {
  pipeId: string;
  phaseId: string;
  onClose: () => void;
  onCreated: (card: Card) => void;
}

const PRIORITIES = [
  { value: "LOW", label: "Baixa", color: "text-green-600" },
  { value: "MEDIUM", label: "Média", color: "text-yellow-600" },
  { value: "HIGH", label: "Alta", color: "text-orange-600" },
  { value: "URGENT", label: "Urgente", color: "text-red-600" },
];

export function CreateCardDialog({
  pipeId,
  phaseId,
  onClose,
  onCreated,
}: CreateCardDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pipes/${pipeId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phaseId,
          dueDate: formData.dueDate || null,
        }),
      });

      if (res.ok) {
        const card = await res.json();
        onCreated(card);
        toast({ title: "Card criado!" });
        onClose();
      } else {
        const data = await res.json();
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Novo card</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="card-title">Título *</Label>
            <Input
              id="card-title"
              placeholder="Descreva o card..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              autoFocus
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="card-description">Descrição</Label>
            <textarea
              id="card-description"
              placeholder="Detalhes adicionais..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-priority">Prioridade</Label>
              <select
                id="card-priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="card-due-date">Prazo</Label>
              <Input
                id="card-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar card
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
