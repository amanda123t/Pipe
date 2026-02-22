"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  GitBranch,
  LayoutDashboard,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  ChevronRight,
  Workflow,
  Users,
  Bell,
  Search,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Organization, Pipe } from "@/types";

interface SidebarProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (currentOrg) {
      fetchPipes(currentOrg.id);
    }
  }, [currentOrg]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
        if (data.length > 0) {
          setCurrentOrg(data[0]);
          setExpandedOrgs(new Set([data[0].id]));
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchPipes = async (orgId: string) => {
    try {
      const res = await fetch(`/api/pipes?organizationId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setPipes(data);
      }
    } catch (error) {
      console.error("Error fetching pipes:", error);
    }
  };

  const toggleOrg = (orgId: string) => {
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) {
        next.delete(orgId);
      } else {
        next.add(orgId);
      }
      return next;
    });
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pipe-purple rounded-lg flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Pipe</span>
        </Link>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <Search className="w-4 h-4" />
          <span>Buscar...</span>
          <span className="ml-auto text-xs bg-gray-200 px-1.5 py-0.5 rounded">⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1 overflow-y-auto">
        {/* Main nav items */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors",
              pathname === item.href
                ? "bg-purple-50 text-pipe-purple"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        {/* Organizations & Pipes */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-3 py-1.5 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pipes
            </span>
            <Link href="/dashboard">
              <button className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {organizations.map((org) => (
            <div key={org.id} className="mb-1">
              <button
                onClick={() => toggleOrg(org.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {expandedOrgs.has(org.id) ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                )}
                <span className="font-medium truncate">{org.name}</span>
              </button>

              {expandedOrgs.has(org.id) && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {pipes.map((pipe) => (
                    <Link
                      key={pipe.id}
                      href={`/pipes/${pipe.id}/kanban`}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                        pathname.includes(pipe.id)
                          ? "bg-purple-50 text-pipe-purple font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <span className="text-base leading-none">
                        {pipe.icon || "📋"}
                      </span>
                      <span className="truncate">{pipe.name}</span>
                      {pipe._count && (
                        <span className="ml-auto text-xs text-gray-400">
                          {pipe._count.cards}
                        </span>
                      )}
                    </Link>
                  ))}

                  {pipes.length === 0 && (
                    <p className="px-3 py-2 text-xs text-gray-400">
                      Nenhum pipe ainda
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 bg-pipe-purple rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user.name || user.email || "U")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </div>
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
