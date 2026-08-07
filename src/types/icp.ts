export interface ICPProfile {
  industry: string;
  companySize: string;
  jobRoles: string;
  painPoints: string;
  buyingSignals: string;
}

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1 – 10 employés" },
  { value: "11-50", label: "11 – 50 employés" },
  { value: "51-200", label: "51 – 200 employés" },
  { value: "201-500", label: "201 – 500 employés" },
  { value: "500+", label: "500+ employés" },
] as const;
