"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import type { KanbanPhase } from "@/types";

const PHASE_COLORS = [
  "#64748B", "#3B82F6", "#F59E0B", "#EF4444",
  "#10B981", "#8B5CF6", "#EC4899", "#6B4EFF",
];

interface CreatePhaseDialogProps {
  pipeId: string;
  onClose: () => void;
  onCreated: (phase: KanbanPhase) => void;
}

export function CreatePhaseDialog({
  pipeId,
  onClose,
  onCreated,
}: CreatePhaseDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#64748B");
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pipes/${pipeId}/phases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, isDone }),
      });

      if (res.ok) {
        const phase = await res.json();
        onCreated(phase);
        toast({ title: "Fase criada!", description: `"${name}" foi adicionada.` });
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Adicionar fase</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label>Nome da fase</Label>
            <Input
              placeholder="Ex: Em revisão"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="mt-1"
            />
          </div>

          <div>
            <Label className="mb-2 block">Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PHASE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDone"
              checked={isDone}
              onChange={(e) => setIsDone(e.target.checked)}
              className="w-4 h-4 accent-pipe-purple"
            />
            <Label htmlFor="isDone" className="cursor-pointer">
              Esta é uma fase de conclusão
            </Label>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar fase
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
