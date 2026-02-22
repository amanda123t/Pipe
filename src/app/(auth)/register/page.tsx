"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro ao criar conta",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada!",
          description: "Redirecionando para o login...",
        });
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Kanban boards ilimitados",
    "Automação de processos",
    "Campos personalizados",
    "Gestão de equipes",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-pipe-purple rounded-xl flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Pipe</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Gerencie seus processos com eficiência
          </h2>
          <p className="text-gray-500 mb-8">
            A plataforma completa para automação de workflows e gestão de
            processos da sua equipe.
          </p>

          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-pipe-purple flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-pipe-purple rounded-full flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Pipeline de Vendas</div>
                <div className="text-xs text-gray-500">4 fases • 12 cards</div>
              </div>
            </div>
            <div className="flex gap-2">
              {["Lead", "Proposta", "Negociação", "Fechado"].map((phase, i) => (
                <div
                  key={phase}
                  className="flex-1 text-center py-1 rounded text-xs font-medium"
                  style={{
                    background: ["#EEF2FF", "#DBEAFE", "#FEF3C7", "#D1FAE5"][i],
                    color: ["#6B4EFF", "#3B82F6", "#F59E0B", "#10B981"][i],
                  }}
                >
                  {phase}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6 md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pipe-purple rounded-xl flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Pipe</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Criar conta grátis
          </h1>
          <p className="text-gray-500 mb-6">
            Comece a usar em segundos, sem cartão de crédito
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="organizationName">
                Nome da organização{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="organizationName"
                placeholder="Minha Empresa"
                value={formData.organizationName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    organizationName: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta grátis"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-pipe-purple font-medium hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
