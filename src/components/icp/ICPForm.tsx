"use client";

import { useState, type FormEvent } from "react";
import type { ICPProfile } from "@/types/icp";
import { COMPANY_SIZE_OPTIONS } from "@/types/icp";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";

interface ICPFormProps {
  onSubmit: (icp: ICPProfile) => void;
  isLoading: boolean;
  initialValues?: ICPProfile;
}

const EMPTY_ICP: ICPProfile = {
  industry: "",
  companySize: "51-200",
  jobRoles: "",
  painPoints: "",
  buyingSignals: "",
};

export function ICPForm({ onSubmit, isLoading, initialValues }: ICPFormProps) {
  const [form, setForm] = useState<ICPProfile>(initialValues ?? EMPTY_ICP);
  const [errors, setErrors] = useState<Partial<Record<keyof ICPProfile, string>>>({});

  function updateField<K extends keyof ICPProfile>(key: K, value: ICPProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Partial<Record<keyof ICPProfile, string>> = {};

    if (!form.industry.trim()) newErrors.industry = "Requis";
    if (!form.jobRoles.trim()) newErrors.jobRoles = "Requis";
    if (!form.painPoints.trim()) newErrors.painPoints = "Requis";
    if (!form.buyingSignals.trim()) newErrors.buyingSignals = "Requis";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(form);
  }

  return (
    <Card>
      <CardHeader
        title="ICP Engine"
        description="Définissez votre Profil Client Idéal pour alimenter les moteurs de génération"
      />
      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Secteur d'activité"
          placeholder="ex. SaaS B2B, FinTech, E-commerce"
          value={form.industry}
          onChange={(e) => updateField("industry", e.target.value)}
          error={errors.industry}
          disabled={isLoading}
        />

        <Select
          label="Taille d'entreprise"
          value={form.companySize}
          onChange={(e) => updateField("companySize", e.target.value)}
          options={COMPANY_SIZE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          disabled={isLoading}
        />

        <div className="sm:col-span-2">
          <Textarea
            label="Rôles cibles"
            placeholder="ex. VP Sales, Directeur Commercial, Head of Growth, CRO"
            value={form.jobRoles}
            onChange={(e) => updateField("jobRoles", e.target.value)}
            error={errors.jobRoles}
            disabled={isLoading}
            className="min-h-[80px]"
          />
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Points de douleur"
            placeholder="ex. Pipeline stagnant, taux de réponse faible, prospection manuelle chronophage, leads non qualifiés..."
            value={form.painPoints}
            onChange={(e) => updateField("painPoints", e.target.value)}
            error={errors.painPoints}
            disabled={isLoading}
          />
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Signaux d'achat"
            placeholder="ex. Levée de fonds récente, recrutement commercial, expansion internationale, changement d'outil CRM..."
            value={form.buyingSignals}
            onChange={(e) => updateField("buyingSignals", e.target.value)}
            error={errors.buyingSignals}
            disabled={isLoading}
            className="min-h-[80px]"
          />
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Exécution du pipeline...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                Lancer le pipeline complet
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
