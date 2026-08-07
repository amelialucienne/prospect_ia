import type { Lead } from "@/types/lead";

const WAALAXY_API_BASE = "https://api.waalaxy.com";

export interface WaalaxyConfig {
  apiKey: string;
  prospectListId: string;
  campaignId?: string;
}

export interface WaalaxySendResult {
  ok: boolean;
  status: number;
  body: unknown;
}

function getWaalaxyConfig(): WaalaxyConfig | null {
  const apiKey = process.env.WAALAXY_API_KEY;
  const prospectListId = process.env.WAALAXY_LIST_ID;
  const campaignId = process.env.WAALAXY_CAMPAIGN_ID;

  if (!apiKey || !prospectListId) return null;
  return { apiKey, prospectListId, campaignId };
}

export function isWaalaxyConfigured(): boolean {
  return getWaalaxyConfig() !== null;
}

/**
 * Push a single lead into the connected Waalaxy account's prospect list
 * (and optionally straight into a campaign). Waalaxy's own browser
 * extension then sends the LinkedIn message from the account that owns
 * the API key — this app never touches LinkedIn credentials or sessions.
 *
 * Requires WAALAXY_API_KEY (generate from Waalaxy > CRM Sync settings)
 * and WAALAXY_LIST_ID (from GET /prospectLists/getProspectLists) as env vars.
 */
export async function sendLeadToWaalaxy(lead: Lead): Promise<WaalaxySendResult> {
  const config = getWaalaxyConfig();
  if (!config) {
    throw new Error(
      "Waalaxy non configuré : ajoute WAALAXY_API_KEY et WAALAXY_LIST_ID dans les variables d'environnement."
    );
  }

  const response = await fetch(`${WAALAXY_API_BASE}/prospects/addProspectFromIntegration`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prospects: [{ url: lead.linkedInUrl }],
      prospectListId: config.prospectListId,
      ...(config.campaignId ? { campaignId: config.campaignId } : {}),
      origin: { name: "prospect_ia" },
    }),
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // no JSON body
  }

  return { ok: response.ok, status: response.status, body };
}

/** Quick connectivity check against GET /integrations/test */
export async function testWaalaxyConnection(): Promise<boolean> {
  const config = getWaalaxyConfig();
  if (!config) return false;

  const response = await fetch(`${WAALAXY_API_BASE}/integrations/test`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) return false;
  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  return Boolean(data);
}
