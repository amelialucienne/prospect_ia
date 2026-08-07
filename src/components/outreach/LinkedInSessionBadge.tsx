"use client";

import { useCallback, useEffect, useState } from "react";
import type { LinkedInSessionStatus } from "@/types/linkedin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function LinkedInSessionBadge({
  onSessionChange,
}: {
  onSessionChange?: (authenticated: boolean) => void;
}) {
  const [session, setSession] = useState<LinkedInSessionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/linkedin/session");
      const data = (await res.json()) as LinkedInSessionStatus;
      setSession(data);
      onSessionChange?.(data.authenticated);
    } catch {
      setSession({
        authenticated: false,
        userDataDir: "",
        error: "Impossible de vérifier la session LinkedIn.",
      });
      onSessionChange?.(false);
    } finally {
      setLoading(false);
    }
  }, [onSessionChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
        <span className="text-xs text-slate-500">Vérification session LinkedIn…</span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
        session.authenticated
          ? "border-emerald-100 bg-emerald-50/60"
          : "border-amber-100 bg-amber-50/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            session.authenticated ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <div>
          <p className="text-sm font-medium text-slate-800">
            {session.authenticated
              ? `LinkedIn connecté${session.profileName ? ` — ${session.profileName}` : ""}`
              : "LinkedIn non connecté"}
          </p>
          {session.error && (
            <p className="mt-0.5 text-xs text-slate-600">{session.error}</p>
          )}
          {!session.authenticated && !session.error && (
            <p className="mt-0.5 text-xs text-slate-600">
              Lancez <code className="rounded bg-white/80 px-1">npm run linkedin:auth</code> pour vous connecter manuellement.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {session.authenticated && (
          <Badge className="bg-emerald-100 text-emerald-700 ring-emerald-200">
            Session active
          </Badge>
        )}
        <Button variant="ghost" size="sm" onClick={() => void refresh()}>
          Actualiser
        </Button>
      </div>
    </div>
  );
}
