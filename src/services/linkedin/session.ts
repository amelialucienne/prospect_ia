import {
  getLinkedInUserDataDir,
  LINKEDIN_FEED_URL,
  LINKEDIN_LOGIN_PATH,
} from "@/lib/linkedin/config";
import type { LinkedInSessionStatus } from "@/types/linkedin";
import { getLinkedInContext } from "./browser";

export async function checkLinkedInSession(): Promise<LinkedInSessionStatus> {
  const userDataDir = getLinkedInUserDataDir();

  try {
    const context = await getLinkedInContext();
    const page = context.pages()[0] ?? (await context.newPage());

    await page.goto(LINKEDIN_FEED_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const url = page.url();

    if (url.includes(LINKEDIN_LOGIN_PATH) || url.includes("/uas/login")) {
      return {
        authenticated: false,
        userDataDir,
        error:
          "Session LinkedIn non trouvée. Lancez « npm run linkedin:auth » pour vous connecter manuellement.",
      };
    }

    let profileName: string | undefined;

    try {
      const meLink = page.locator('a[href*="/in/"]').first();
      const ariaLabel = await meLink.getAttribute("aria-label", {
        timeout: 5000,
      });
      if (ariaLabel) {
        profileName = ariaLabel.replace(/,.*$/, "").trim();
      }
    } catch {
      // Profile name is optional
    }

    return {
      authenticated: true,
      profileName,
      userDataDir,
    };
  } catch (err) {
    return {
      authenticated: false,
      userDataDir,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de vérifier la session LinkedIn.",
    };
  }
}
