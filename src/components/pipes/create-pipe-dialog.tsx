"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import type { Pipe } from "@/types";

const PIPE_COLORS = [
  "#6B4EFF", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4",
];

const PIPE_ICONS = ["📋", "💼", "🚀", "💡", "⚡", "🎯", "📊", "🔧", "🌟", "📦"];

interface CreatePipeDialogProps {
  organizationId: string;
  onClose: () => void;
  onCreated: (pipe: Pipe) => void;
}

export function CreatePipeDialog({
  organizationId,
  onClose,
  onCreated,
}: CreatePipeDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📋",
    color: "#6B4EFF",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, organizationId }),
      });

      if (res.ok) {
        const pipe = await res.json();
        onCreated(pipe);
        toast({
          title: "Pipe criado!",
          description: `"${pipe.name}" foi criado com sucesso.`,
        });
        onClose();
      } else {
        const data = await res.json();
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        });
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
          <h2 className="text-lg font-semibold text-gray-900">Criar novo Pipe</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon & Color Preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${formData.color}20`, border: `2px solid ${formData.color}40` }}
            >
              {formData.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Ícone</p>
              <div className="flex gap-1 flex-wrap">
                {PIPE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                      formData.icon === icon
                        ? "bg-purple-100 ring-2 ring-pipe-purple"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <Label className="mb-2 block">Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PIPE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-7 h-7 rounded-full transition-all ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="pipe-name">Nome do Pipe *</Label>
            <Input
              id="pipe-name"
              placeholder="Ex: Pipeline de Vendas"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="mt-1"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="pipe-description">Descrição</Label>
            <Input
              id="pipe-description"
              placeholder="Descreva o propósito deste pipe..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1"
            />
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
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Criar Pipe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
