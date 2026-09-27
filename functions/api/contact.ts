/**
 * Cloudflare Pages Function — contact form delivery via Resend.
 *
 * POST /api/contact  { name, email, message, company }
 *
 * `company` is a honeypot: real visitors never fill it, bots usually do.
 * When RESEND_API_KEY is unset the endpoint still answers successfully so the
 * form never appears broken — it just logs instead of sending.
 */

const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;

interface Context {
  request: Request;
  env: {
    RESEND_API_KEY?: string;
    CONTACT_TO?: string;
    CONTACT_FROM?: string;
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const clamp = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function onRequestPost({ request, env }: Context) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: answer as if accepted, send nothing.
  if (clamp(payload.company, 100)) return json({ ok: true });

  const name = clamp(payload.name, MAX_NAME);
  const email = clamp(payload.email, MAX_EMAIL);
  const message = clamp(payload.message, MAX_MESSAGE);

  if (!name) return json({ ok: false, error: "Name is required." }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "A valid email is required." }, 400);
  if (message.length < 10) return json({ ok: false, error: "Please write a longer message." }, 400);

  const to = env.CONTACT_TO || "contatofelp011@gmail.com";
  const subject = `Website inquiry — ${name}`;

  if (!env.RESEND_API_KEY) {
    console.log("contact form (no RESEND_API_KEY set):", { name, email, message, subject });
    return json({ ok: true, delivered: false });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || "FELP011 website <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject,
        text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("resend error", response.status, detail);
      return json({ ok: false, error: "Delivery failed." }, 502);
    }

    return json({ ok: true, delivered: true });
  } catch (error) {
    console.error("contact form exception", error);
    return json({ ok: false, error: "Delivery failed." }, 502);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}

export async function onRequest() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
