/**
 * Slack bildirimi — eski httpRequest node'larının koddaki karşılığı.
 * Kanal tenant_config.slackChannel'dan; token env'de (SLACK_BOT_TOKEN).
 * Token yoksa sessizce no-op (dry-run/test güvenli).
 */
export async function notifySlack(channel: string | null | undefined, text: string): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || !channel) {
    console.log(`[slack:skip] kanal=${channel ?? "—"} token=${token ? "var" : "yok"} :: ${text.split("\n")[0]}`);
    return false;
  }
  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ channel, text }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) console.warn(`[slack:hata] ${data.error}`);
    return data.ok;
  } catch (err) {
    console.warn(`[slack:exception] ${(err as Error).message}`);
    return false;
  }
}
