"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  GripVertical,
  Trash2,
  Settings,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  Mail,
  Phone,
  Link2,
  List,
  CheckSquare,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getFieldTypeLabel } from "@/lib/utils";
import type { Pipe, Field, FieldType } from "@/types";

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType; description: string }[] = [
  { type: "SHORT_TEXT", label: "Texto curto", icon: Type, description: "Respostas breves" },
  { type: "LONG_TEXT", label: "Texto longo", icon: Type, description: "Parágrafos e detalhes" },
  { type: "NUMBER", label: "Número", icon: Hash, description: "Valores numéricos" },
  { type: "DATE", label: "Data", icon: Calendar, description: "Datas" },
  { type: "DATETIME", label: "Data e hora", icon: Clock, description: "Data com hora" },
  { type: "SELECT", label: "Seleção", icon: List, description: "Uma opção" },
  { type: "MULTISELECT", label: "Multi-seleção", icon: CheckSquare, description: "Múltiplas opções" },
  { type: "CHECKBOX", label: "Checkbox", icon: ToggleLeft, description: "Sim ou não" },
  { type: "EMAIL", label: "E-mail", icon: Mail, description: "Endereço de e-mail" },
  { type: "PHONE", label: "Telefone", icon: Phone, description: "Número de telefone" },
  { type: "URL", label: "URL", icon: Link2, description: "Link ou endereço web" },
];

interface FieldsSettingsClientProps {
  pipe: Pipe & { fields: Field[]; phases: { id: string; name: string }[] };
}

export function FieldsSettingsClient({ pipe }: FieldsSettingsClientProps) {
  const { toast } = useToast();
  const [fields, setFields] = useState<Field[]>(pipe.fields);
  const [showAddField, setShowAddField] = useState(false);
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);
  const [fieldForm, setFieldForm] = useState({
    label: "",
    required: false,
    description: "",
    options: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAddField = async () => {
    if (!selectedType || !fieldForm.label.trim()) return;

    setLoading(true);
    try {
      const options =
        (selectedType === "SELECT" || selectedType === "MULTISELECT") &&
        fieldForm.options
          ? fieldForm.options.split(",").map((o) => o.trim()).filter(Boolean)
          : undefined;

      const res = await fetch(`/api/pipes/${pipe.id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: fieldForm.label,
          type: selectedType,
          required: fieldForm.required,
          description: fieldForm.description,
          options,
        }),
      });

      if (res.ok) {
        const field = await res.json();
        setFields((prev) => [...prev, field]);
        setShowAddField(false);
        setSelectedType(null);
        setFieldForm({ label: "", required: false, description: "", options: "" });
        toast({ title: "Campo adicionado!" });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (type: string) => {
    const ft = FIELD_TYPES.find((f) => f.type === type);
    return ft?.icon || Type;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/pipes/${pipe.id}/kanban`}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Campos do Pipe
            </h1>
            <p className="text-sm text-gray-500">{pipe.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current fields */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Campos personalizados ({fields.length})
              </h2>
              <Button
                size="sm"
                onClick={() => setShowAddField(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar campo
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-700 mb-1">
                  Nenhum campo personalizado
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Campos permitem capturar informações específicas em cada card
                </p>
                <Button size="sm" onClick={() => setShowAddField(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar primeiro campo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field) => {
                  const Icon = getFieldIcon(field.type);
                  return (
                    <div
                      key={field.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 group hover:border-purple-200 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-pipe-purple" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {field.label}
                          </span>
                          {field.required && (
                            <Badge variant="secondary" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {getFieldTypeLabel(field.type)}
                        </span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add field panel */}
          {showAddField && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedType ? "Configurar campo" : "Tipo de campo"}
              </h3>

              {!selectedType ? (
                <div className="space-y-1.5">
                  {FIELD_TYPES.map((ft) => (
                    <button
                      key={ft.type}
                      onClick={() => setSelectedType(ft.type)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 hover:text-pipe-purple transition-colors text-left group"
                    >
                      <div className="w-8 h-8 bg-gray-100 group-hover:bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ft.icon className="w-4 h-4 text-gray-500 group-hover:text-pipe-purple" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-pipe-purple">
                          {ft.label}
                        </div>
                        <div className="text-xs text-gray-400">{ft.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                    {(() => {
                      const ft = FIELD_TYPES.find((f) => f.type === selectedType);
                      const Icon = ft?.icon || Type;
                      return (
                        <>
                          <Icon className="w-4 h-4 text-pipe-purple" />
                          <span className="text-sm font-medium text-pipe-purple">
                            {ft?.label}
                          </span>
                        </>
                      );
                    })()}
                    <button
                      onClick={() => setSelectedType(null)}
                      className="ml-auto text-xs text-purple-400 hover:text-purple-600"
                    >
                      Mudar
                    </button>
                  </div>

                  <div>
                    <Label>Nome do campo *</Label>
                    <Input
                      placeholder="Ex: Empresa"
                      value={fieldForm.label}
                      onChange={(e) =>
                        setFieldForm({ ...fieldForm, label: e.target.value })
                      }
                      autoFocus
                      className="mt-1"
                    />
                  </div>

                  {(selectedType === "SELECT" || selectedType === "MULTISELECT") && (
                    <div>
                      <Label>Opções (separadas por vírgula)</Label>
                      <Input
                        placeholder="Opção 1, Opção 2, Opção 3"
                        value={fieldForm.options}
                        onChange={(e) =>
                          setFieldForm({ ...fieldForm, options: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Descrição</Label>
                    <Input
                      placeholder="Instrução para preenchimento..."
                      value={fieldForm.description}
                      onChange={(e) =>
                        setFieldForm({ ...fieldForm, description: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={fieldForm.required}
                      onChange={(e) =>
                        setFieldForm({ ...fieldForm, required: e.target.checked })
                      }
                      className="w-4 h-4 accent-pipe-purple"
                    />
                    <Label htmlFor="required" className="cursor-pointer">
                      Campo obrigatório
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddField(false);
                        setSelectedType(null);
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddField}
                      disabled={loading || !fieldForm.label.trim()}
                      className="flex-1"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
