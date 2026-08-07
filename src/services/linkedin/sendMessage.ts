function humanDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeProfileUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http")) {
    return trimmed;
  }
  return `https://www.linkedin.com/in/${trimmed.replace(/^\/+/, "")}`;
}

export interface SendMessageResult {
  success: boolean;
  error?: string;
}

export async function sendLinkedInMessage(
  profileUrl: string,
  message: string
): Promise<SendMessageResult> {
  const { getLinkedInContext } = await import("./browser");
  const context = await getLinkedInContext();
  const page = await context.newPage();

  try {
    const url = normalizeProfileUrl(profileUrl);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await humanDelay(1500, 3000);

    if (page.url().includes("/login")) {
      return {
        success: false,
        error:
          "Session expirée. Relancez « npm run linkedin:auth » pour vous reconnecter.",
      };
    }

    const messageButton = page
      .locator(
        'main button:has-text("Message"), main a:has-text("Message"), button[aria-label*="Message"]'
      )
      .first();

    await messageButton.click({ timeout: 10000 });
    await humanDelay(1000, 2000);

    const messageBox = page
      .locator(
        'div.msg-form__contenteditable[contenteditable="true"], div[role="textbox"][contenteditable="true"]'
      )
      .first();

    await messageBox.waitFor({ state: "visible", timeout: 15000 });
    await messageBox.click();
    await messageBox.fill(message);
    await humanDelay(800, 1500);

    const sendButton = page
      .locator(
        'button.msg-form__send-button:enabled, button[type="submit"]:has-text("Envoyer"), button[type="submit"]:has-text("Send")'
      )
      .first();

    await sendButton.click({ timeout: 10000 });
    await humanDelay(2000, 3000);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Échec de l'envoi du message LinkedIn.",
    };
  } finally {
    await page.close();
  }
}
