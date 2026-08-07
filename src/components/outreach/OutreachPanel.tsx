"use client";

import { useState } from "react";
import type { Lead } from "@/types/lead";
import type { LinkedInSessionStatus } from "@/types/linkedin";
import type { OutreachDelivery, OutreachMessageType } from "@/types/outreach";
import {
  getMessageByType,
  OUTREACH_MESSAGE_LABELS,
} from "@/types/outreach";
import {
  getDeliveryForType,
  pollSendJob,
} from "@/lib/linkedin/outreachHelpers";
import { Card, CardHeader } from "@/components/ui/Card";
import { TemperatureBadge, ScoreBar } from "@/components/crm/LeadBadges";
import { StatusBadge } from "@/components/crm/StatusSelect";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LinkedInSessionBadge } from "./LinkedInSessionBadge";

interface MessageCardProps {
  title: string;
  subtitle: string;
  message: string;
  messageType: OutreachMessageType;
  delivery?: OutreachDelivery;
  linkedInAuthenticated: boolean;
  onSend: (messageType: OutreachMessageType) => Promise<void>;
}

function DeliveryBadge({ delivery }: { delivery?: OutreachDelivery }) {
  if (!delivery || delivery.status === "idle") return null;

  const styles: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600 ring-slate-200",
    sending: "bg-blue-50 text-blue-700 ring-blue-200",
    sent: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
  };

  const labels: Record<string, string> = {
    pending: "En file",
    sending: "Envoi…",
    sent: "Envoyé",
    failed: "Échec",
  };

  return (
    <Badge className={styles[delivery.status] ?? styles.pending}>
      {labels[delivery.status] ?? delivery.status}
    </Badge>
  );
}

function MessageCard({
  title,
  subtitle,
  message,
  messageType,
  delivery,
  linkedInAuthenticated,
  onSend,
}: MessageCardProps) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const isSent = delivery?.status === "sent";
  const isBusy =
    sending || delivery?.status === "sending" || delivery?.status === "pending";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      await onSend(messageType);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 ring-1 ring-slate-100">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <DeliveryBadge delivery={delivery} />
          </div>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            {copied ? "Copié !" : "Copier"}
          </button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!linkedInAuthenticated || isSent || isBusy}
            onClick={() => void handleSend()}
          >
            {isBusy ? "Envoi…" : isSent ? "Envoyé" : "Envoyer LinkedIn"}
          </Button>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      {delivery?.error && (
        <p className="mt-2 text-xs text-red-600">{delivery.error}</p>
      )}
    </div>
  );
}

interface OutreachPanelProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  onDeliveryUpdate: (
    leadId: string,
    messageType: OutreachMessageType,
    update: Partial<OutreachDelivery>
  ) => void;
  onLeadContacted: (leadId: string) => void;
}

export function OutreachPanel({
  leads,
  selectedLeadId,
  onSelectLead,
  onDeliveryUpdate,
  onLeadContacted,
}: OutreachPanelProps) {
  const [sessionAuthenticated, setSessionAuthenticated] = useState(false);
  const [waalaxyStatus, setWaalaxyStatus] = useState<
    Record<string, "idle" | "sending" | "queued" | "error">
  >({});

  const selectedLead =
    leads.find((l) => l.id === selectedLeadId) ?? leads[0] ?? null;

  async function checkSession(): Promise<boolean> {
    try {
      const res = await fetch("/api/linkedin/session");
      const data = (await res.json()) as LinkedInSessionStatus;
      setSessionAuthenticated(data.authenticated);
      return data.authenticated;
    } catch {
      setSessionAuthenticated(false);
      return false;
    }
  }

  async function handleSend(
    lead: Lead,
    messageType: OutreachMessageType
  ): Promise<void> {
    const authenticated = sessionAuthenticated || (await checkSession());
    if (!authenticated) return;

    onDeliveryUpdate(lead.id, messageType, { status: "pending" });

    try {
      const message = getMessageByType(lead.outreach, messageType);

      const res = await fetch("/api/linkedin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          linkedInUrl: lead.linkedInUrl,
          message,
          messageType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        onDeliveryUpdate(lead.id, messageType, {
          status: "failed",
          error: data.error ?? "Échec de l'envoi.",
        });
        return;
      }

      onDeliveryUpdate(lead.id, messageType, {
        status: "sending",
        jobId: data.jobId,
      });

      const result = await pollSendJob(data.jobId, (status) => {
        if (status === "running") {
          onDeliveryUpdate(lead.id, messageType, { status: "sending" });
        }
      });

      if (result.status === "completed") {
        onDeliveryUpdate(lead.id, messageType, {
          status: "sent",
          sentAt: new Date().toISOString(),
        });
        if (messageType === "initial" && lead.status === "new") {
          onLeadContacted(lead.id);
        }
      } else {
        onDeliveryUpdate(lead.id, messageType, {
          status: "failed",
          error: result.error ?? "Échec de l'envoi.",
        });
      }
    } catch (err) {
      onDeliveryUpdate(lead.id, messageType, {
        status: "failed",
        error:
          err instanceof Error ? err.message : "Erreur réseau lors de l'envoi.",
      });
    }
  }

  async function handleSendToWaalaxy(lead: Lead): void {
  const rows = [
    ["Nom", "Entreprise", "Rôle", "LinkedIn URL"],
    [lead.name, lead.company, lead.role, lead.linkedInUrl],
  ];
  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `waalaxy-${lead.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  setWaalaxyStatus((prev) => ({ ...prev, [lead.id]: "queued" }));
  if (lead.status === "new") onLeadContacted(lead.id);
}

  if (leads.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
            <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Aucune séquence disponible</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Générez des leads via le pipeline pour créer des messages d&apos;outreach personnalisés.
          </p>
        </div>
      </Card>
    );
  }

  const messageCards: {
    type: OutreachMessageType;
    title: string;
    subtitle: string;
  }[] = [
    {
      type: "initial",
      title: OUTREACH_MESSAGE_LABELS.initial,
      subtitle: "Jour J — Premier contact",
    },
    {
      type: "followUpDay2",
      title: OUTREACH_MESSAGE_LABELS.followUpDay2,
      subtitle: "J+2 — Suivi personnalisé",
    },
    {
      type: "followUpDay5",
      title: OUTREACH_MESSAGE_LABELS.followUpDay5,
      subtitle: "J+5 — Dernière tentative",
    },
  ];

  return (
    <div className="space-y-5">
      <LinkedInSessionBadge onSessionChange={setSessionAuthenticated} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card padding="sm" className="lg:col-span-1">
          <CardHeader
            title="Outreach Engine"
            description="Séquences personnalisées par lead"
          />
          <div className="max-h-[480px] space-y-2 overflow-y-auto">
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => onSelectLead(lead.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                  selectedLead?.id === lead.id
                    ? "border-blue-200 bg-blue-50/60"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                <p className="text-xs text-slate-500">{lead.company}</p>
                <div className="mt-2 flex items-center gap-2">
                  <TemperatureBadge temperature={lead.temperature} />
                  <ScoreBar score={lead.buyingIntentScore} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        {selectedLead && (
          <Card className="lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedLead.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedLead.role} · {selectedLead.company}
                </p>
                <a
                  href={selectedLead.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                >
                  {selectedLead.linkedInUrl}
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TemperatureBadge temperature={selectedLead.temperature} />
                <StatusBadge status={selectedLead.status} />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={waalaxyStatus[selectedLead.id] === "sending" || waalaxyStatus[selectedLead.id] === "queued"}
                  onClick={() => void handleSendToWaalaxy(selectedLead)}
                >
                  {waalaxyStatus[selectedLead.id] === "sending"
                    ? "Envoi…"
                    : waalaxyStatus[selectedLead.id] === "queued"
                      ? "Ajouté à Waalaxy ✓"
                      : waalaxyStatus[selectedLead.id] === "error"
                        ? "Échec — réessayer"
                        : "Lancer via Waalaxy"}
                </Button>
              </div>
            </div>
            <p className="mb-4 text-xs text-slate-400">
              &laquo; Lancer via Waalaxy &raquo; ajoute ce lead à la campagne configurée dans le
              compte Waalaxy connecté — les messages ci-dessous (initial + relances) sont alors
              envoyés automatiquement par la séquence Waalaxy, depuis le compte LinkedIn de son
              propriétaire.
            </p>

            <div className="mb-4 rounded-xl bg-amber-50/80 px-4 py-3 ring-1 ring-amber-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Point de douleur identifié
              </p>
              <p className="mt-1 text-sm text-slate-700">{selectedLead.painPoint}</p>
            </div>

            <div className="space-y-3">
              {messageCards.map(({ type, title, subtitle }) => (
                <MessageCard
                  key={type}
                  title={title}
                  subtitle={subtitle}
                  message={getMessageByType(selectedLead.outreach, type)}
                  messageType={type}
                  delivery={getDeliveryForType(
                    selectedLead.outreachDeliveries,
                    type
                  )}
                  linkedInAuthenticated={sessionAuthenticated}
                  onSend={(messageType) =>
                    handleSend(selectedLead, messageType)
                  }
                />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
