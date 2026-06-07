/**
 * Gmail gönderim transport'u — eski n8n Gmail node'unun koddaki karşılığı.
 *
 * Tasarım: EmailTransport arayüzü → gerçek GmailTransport (googleapis OAuth2 refresh token)
 * + MockTransport (test/dry-run, gönderilmez sadece kaydeder). Böylece tüm sequence/reply
 * mantığı canlı Gmail OLMADAN test edilebilir; refresh token gelince factory gerçek transport'a geçer.
 *
 * Kimlik bilgileri YALNIZ env'de (GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN/SENDER) — repoda asla.
 */
import { google } from "googleapis";

export interface OutgoingEmail {
  to: string;
  subject: string;
  body: string; // düz metin
  cc?: string;
  /** Yanıt zincirleme için (reply-handler): orijinal messageId. */
  inReplyTo?: string;
  threadId?: string;
}

export interface SentResult {
  messageId: string;
  threadId?: string;
}

export interface EmailTransport {
  readonly kind: "gmail" | "mock";
  send(msg: OutgoingEmail): Promise<SentResult>;
}

/** RFC 2822 ham mesaj → base64url (Gmail API raw alanı). */
export function buildRawMessage(from: string, msg: OutgoingEmail): string {
  const headers = [
    `From: ${from}`,
    `To: ${msg.to}`,
    msg.cc ? `Cc: ${msg.cc}` : null,
    `Subject: ${encodeHeader(msg.subject)}`,
    msg.inReplyTo ? `In-Reply-To: ${msg.inReplyTo}` : null,
    msg.inReplyTo ? `References: ${msg.inReplyTo}` : null,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
  ].filter(Boolean);
  const raw = `${headers.join("\r\n")}\r\n\r\n${msg.body}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}

/** UTF-8 başlıkları RFC 2047 encoded-word ile kodla (Türkçe konu satırları için). */
function encodeHeader(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value; // saf ASCII ise dokunma
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

export class GmailTransport implements EmailTransport {
  readonly kind = "gmail" as const;
  private readonly sender: string;

  constructor(
    private readonly creds: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      sender: string;
    },
  ) {
    this.sender = creds.sender;
  }

  async send(msg: OutgoingEmail): Promise<SentResult> {
    const oauth2 = new google.auth.OAuth2(this.creds.clientId, this.creds.clientSecret);
    oauth2.setCredentials({ refresh_token: this.creds.refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2 });

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: buildRawMessage(this.sender, msg),
        ...(msg.threadId ? { threadId: msg.threadId } : {}),
      },
    });
    return { messageId: res.data.id ?? "", threadId: res.data.threadId ?? undefined };
  }
}

/** Test/dry-run: hiçbir şey göndermez, gönderilenleri belleğe kaydeder. */
export class MockTransport implements EmailTransport {
  readonly kind = "mock" as const;
  readonly outbox: Array<OutgoingEmail & { messageId: string }> = [];
  private counter = 0;

  async send(msg: OutgoingEmail): Promise<SentResult> {
    this.counter += 1;
    const messageId = `mock-${this.counter}-${msg.to}`;
    this.outbox.push({ ...msg, messageId });
    return { messageId, threadId: msg.threadId ?? `thread-${this.counter}` };
  }
}

/**
 * Factory: dryRun veya eksik kimlik bilgisi → MockTransport; aksi halde GmailTransport.
 * Üretim worker'ında creds env'de olur; testte dryRun=true verilir.
 */
export function createTransport(opts?: { dryRun?: boolean }): EmailTransport {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const sender = process.env.GMAIL_SENDER;

  if (opts?.dryRun || !clientId || !clientSecret || !refreshToken || !sender) {
    return new MockTransport();
  }
  return new GmailTransport({ clientId, clientSecret, refreshToken, sender });
}
