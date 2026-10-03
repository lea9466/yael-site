import "server-only";

import { createHash, randomBytes } from "node:crypto";

const RAVMESSAGE_API_TIMEOUT_MS = 8000;

export type AddRavMessageSubscriberInput = {
  fullName: string;
  email: string;
};

export type AddRavMessageSubscriberResult =
  | { ok: true }
  | { ok: false; reason: "config" | "network" | "rejected" };

type RavMessageConfig = {
  clientKey: string;
  clientSecret: string;
  userKey: string;
  userSecret: string;
  listId: string;
};

// Note: when RavMessage support issues new tokens for this connection, the
// pair they label "client" has been observed to actually authenticate as
// this API's u_key/u_secret, and the pair they label "user" as c_key/c_secret
// (confirmed empirically — swapping fixed a 500 on every request). If tokens
// are ever rotated and auth starts failing again, try swapping
// RAVMESSAGE_CLIENT_* and RAVMESSAGE_USER_* in .env.local before anything else.

function readConfig(): RavMessageConfig | null {
  const clientKey = process.env.RAVMESSAGE_CLIENT_KEY?.trim() || null;
  const clientSecret = process.env.RAVMESSAGE_CLIENT_SECRET?.trim() || null;
  const userKey = process.env.RAVMESSAGE_USER_KEY?.trim() || null;
  const userSecret = process.env.RAVMESSAGE_USER_SECRET?.trim() || null;
  const listId = process.env.RAVMESSAGE_LIST_ID?.trim() || null;

  if (!clientKey || !clientSecret || !userKey || !userSecret || !listId) {
    return null;
  }

  return { clientKey, clientSecret, userKey, userSecret, listId };
}

function md5(value: string): string {
  return createHash("md5").update(value).digest("hex");
}

/**
 * Builds the RavMesser (רב מסר) REST API "Authorization" header.
 * Scheme: https://github.com/responder/restapi/tree/master/Authentication
 * — comma-separated, url-encoded `c_key`/`c_secret`/`u_key`/`u_secret`/
 * `nonce`/`timestamp`, where `c_secret`/`u_secret` are md5(secret + nonce).
 */
function buildAuthorizationHeader(config: RavMessageConfig): string {
  const nonce = randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const cSecret = md5(config.clientSecret + nonce);
  const uSecret = md5(config.userSecret + nonce);

  const params: Record<string, string> = {
    c_key: config.clientKey,
    c_secret: cSecret,
    u_key: config.userKey,
    u_secret: uSecret,
    nonce,
    timestamp,
  };

  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join(",");
}

/**
 * Adds a subscriber to the configured RavMesser list.
 * https://github.com/responder/restapi/tree/master/Subscribers/ByList
 *
 * Treated as idempotent: RavMesser silently no-ops (rather than erroring)
 * when the email is already on the list, so a visitor submitting twice
 * still sees success.
 */
export async function addRavMessageSubscriber(
  input: AddRavMessageSubscriberInput
): Promise<AddRavMessageSubscriberResult> {
  const config = readConfig();

  if (!config) {
    console.error("[newsletter-signup] RavMessage not configured", {
      at: new Date().toISOString(),
    });
    return { ok: false, reason: "config" };
  }

  const authorization = buildAuthorizationHeader(config);
  const subscribers = [
    {
      NAME: input.fullName,
      EMAIL: input.email,
      NOTIFY: 2, // use the list's own notification/welcome-email settings
    },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RAVMESSAGE_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.responder.co.il/main/lists/${encodeURIComponent(config.listId)}/subscribers`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `subscribers=${encodeURIComponent(JSON.stringify(subscribers))}`,
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      console.error("[newsletter-signup] RavMessage rejected subscriber", {
        at: new Date().toISOString(),
        status: response.status,
        body: bodyText.slice(0, 500),
      });
      return { ok: false, reason: "rejected" };
    }

    return { ok: true };
  } catch (error) {
    console.error("[newsletter-signup] RavMessage request failed", {
      at: new Date().toISOString(),
      type: error instanceof Error ? error.name : "unknown",
    });
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timeout);
  }
}
