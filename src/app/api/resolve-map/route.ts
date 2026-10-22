import { isShortMapLink, parseMapLink } from "../../rules";

/**
 * Opens a Google Maps short share link (maps.app.goo.gl/…) and reads the point it leads to.
 * Browsers cannot do this themselves (cross-origin), so it happens here. Only Google hosts are followed.
 */
const ALLOWED_HOST = /^(maps\.app\.goo\.gl|goo\.gl|(www\.|maps\.|consent\.)?google\.[a-z.]+)$/i;
const MAX_HOPS = 6;

function allowed(url: URL) {
  return url.protocol === "https:" && ALLOWED_HOST.test(url.hostname);
}

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url")?.trim() ?? "";
  if (!isShortMapLink(target)) return Response.json({ error: "unsupported" }, { status: 400 });

  let current: URL;
  try {
    current = new URL(target);
  } catch {
    return Response.json({ error: "unsupported" }, { status: 400 });
  }

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    if (!allowed(current)) break;
    const found = parseMapLink(current.toString());
    // The first hop is the short link itself, which holds no coordinates.
    if (hop > 0 && found) return Response.json(found);

    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        headers: { "user-agent": "Mozilla/5.0 (compatible; AlJoudiSpa/1.0)", "accept-language": "en" },
      });
    } catch {
      return Response.json({ error: "unreachable" }, { status: 502 });
    }

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      try {
        current = new URL(location, current);
      } catch {
        break;
      }
      // Consent pages carry the real destination in ?continue=.
      const next = current.searchParams.get("continue");
      if (next) {
        try {
          current = new URL(next);
        } catch {
          break;
        }
      }
      continue;
    }

    // Landed on a page: some Google pages put the point in the HTML instead of the URL.
    if (response.ok && allowed(current)) {
      const html = (await response.text()).slice(0, 400_000);
      const fromPage = parseMapLink(html.match(/https:\/\/www\.google\.com\/maps\/[^"'\s<]+/)?.[0] ?? "");
      if (fromPage) return Response.json(fromPage);
    }
    break;
  }

  return Response.json({ error: "not_found" }, { status: 404 });
}
