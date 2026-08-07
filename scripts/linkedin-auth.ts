/**
 * Ouvre un navigateur Chromium pour connexion LinkedIn manuelle.
 * Aucun mot de passe n'est stocké — la session persiste dans .linkedin-profile/.
 *
 * Usage: npm run linkedin:auth
 */
import { chromium } from "playwright";
import path from "path";

const userDataDir =
  process.env.LINKEDIN_USER_DATA_DIR ??
  path.join(process.cwd(), ".linkedin-profile");

const FEED_URL = "https://www.linkedin.com/feed/";

async function main() {
  console.log("Ouverture du navigateur pour connexion LinkedIn...");
  console.log(`Profil persistant : ${userDataDir}`);
  console.log("");
  console.log("1. Connectez-vous manuellement à LinkedIn");
  console.log("2. Une fois sur le fil d'actualité, fermez le navigateur");
  console.log("");

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    locale: "fr-FR",
  });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(FEED_URL);

  await new Promise<void>((resolve) => {
    context.on("close", () => resolve());
  });

  console.log("Session sauvegardée. L'automatisation peut utiliser ce profil.");
}

main().catch((err) => {
  console.error("Erreur:", err instanceof Error ? err.message : err);
  process.exit(1);
});
