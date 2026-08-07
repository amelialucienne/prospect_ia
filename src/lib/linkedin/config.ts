import path from "path";

export function getLinkedInUserDataDir(): string {
  return (
    process.env.LINKEDIN_USER_DATA_DIR ??
    path.join(process.cwd(), ".linkedin-profile")
  );
}

export function isLinkedInHeadless(): boolean {
  return process.env.LINKEDIN_HEADLESS !== "false";
}

export function isLinkedInAutomationEnabled(): boolean {
  // Off by default: this module drives a real Chromium session with Playwright
  // and a persistent cookie profile (.linkedin-profile/). That doesn't run on
  // Vercel (ephemeral filesystem, no long-lived browser, function size/time
  // limits) and it automates actions on a real LinkedIn account outside
  // LinkedIn's own tooling, which their User Agreement prohibits and can get
  // the account restricted. Use the Waalaxy integration (src/services/waalaxy.ts)
  // for production sending instead. Only flip this on for local/manual use
  // if you understand and accept that risk.
  return process.env.LINKEDIN_AUTOMATION_ENABLED === "true";
}

export const LINKEDIN_FEED_URL = "https://www.linkedin.com/feed/";
export const LINKEDIN_LOGIN_PATH = "/login";
