// Light protection for the public API. Files starting with "_" are not exposed as routes by Vercel.
//  1) Only same-origin browser requests are accepted (the app calls its own server).
//  2) A small per-IP rate limit. It lives in the memory of one server instance, so it is a speed
//     bump for scripts, not a hard limit. Normal use by one person stays far below it.

const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map();

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || (req.socket && req.socket.remoteAddress) || "unknown";
}

export function guard(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch (e) {
      originHost = "";
    }
    if (originHost !== req.headers.host) {
      res.status(403).json({ error: "Not allowed." });
      return false;
    }
  }

  if (req.method === "POST") {
    const now = Date.now();
    const ip = clientIp(req);
    const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
      res.status(429).json({
        error: { message: "You are going a little fast. Please wait a minute and try again." },
      });
      return false;
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 500) {
      for (const [key, times] of hits) {
        if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
      }
    }
  }
  return true;
}
