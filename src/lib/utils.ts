import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `há ${days} dia${days > 1 ? "s" : ""}`;
  if (hours > 0) return `há ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  return "agora";
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "URGENT":
      return "text-red-500 bg-red-50";
    case "HIGH":
      return "text-orange-500 bg-orange-50";
    case "MEDIUM":
      return "text-yellow-500 bg-yellow-50";
    case "LOW":
      return "text-green-500 bg-green-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "URGENT":
      return "Urgente";
    case "HIGH":
      return "Alta";
    case "MEDIUM":
      return "Média";
    case "LOW":
      return "Baixa";
    default:
      return priority;
  }
}

export function getFieldTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SHORT_TEXT: "Texto curto",
    LONG_TEXT: "Texto longo",
    NUMBER: "Número",
    DATE: "Data",
    DATETIME: "Data e hora",
    SELECT: "Seleção",
    MULTISELECT: "Múltipla seleção",
    CHECKBOX: "Checkbox",
    EMAIL: "E-mail",
    PHONE: "Telefone",
    URL: "URL",
    ATTACHMENT: "Anexo",
    ASSIGNEE: "Responsável",
    LABEL: "Etiqueta",
  };
  return labels[type] || type;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
