// "Report a problem" from the app. Google Play asks apps that show AI-generated text to let people
// flag bad results without leaving the app. A report is written to the server log so the owner can
// read it in Vercel (project > Logs) and improve the prompts or filters. Nothing else is stored.
import { guard } from "./_guard.js";

const TOOLS = ["title", "hooks", "tags", "hashtags", "description"];
const REASONS = ["offensive", "misleading", "other"];
const clip = (value, max) => String(value == null ? "" : value).slice(0, max);

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (!guard(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const body = req.body || {};
  const tool = TOOLS.includes(body.tool) ? body.tool : "";
  const reason = REASONS.includes(body.reason) ? body.reason : "other";
  const topic = clip(body.topic, 200).trim();
  const content = clip(body.content, 4000).trim();
  if (!tool || !content) {
    return res.status(400).json({ error: "Nothing to report." });
  }

  console.warn("APP_REPORT " + JSON.stringify({ at: new Date().toISOString(), tool, reason, topic, content }));
  return res.status(200).json({ ok: true });
}
