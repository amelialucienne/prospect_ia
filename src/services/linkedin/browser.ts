import fs from "fs";
import { chromium, type BrowserContext } from "playwright";
import {
  getLinkedInUserDataDir,
  isLinkedInHeadless,
} from "@/lib/linkedin/config";

let context: BrowserContext | null = null;

export async function getLinkedInContext(): Promise<BrowserContext> {
  if (context) {
    return context;
  }

  const userDataDir = getLinkedInUserDataDir();
  fs.mkdirSync(userDataDir, { recursive: true });

  context = await chromium.launchPersistentContext(userDataDir, {
    headless: isLinkedInHeadless(),
    viewport: { width: 1280, height: 800 },
    locale: "fr-FR",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  return context;
}

export async function closeLinkedInContext(): Promise<void> {
  if (context) {
    await context.close();
    context = null;
  }
}
