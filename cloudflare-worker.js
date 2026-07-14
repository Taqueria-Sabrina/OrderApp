/**
 * Cloudflare Worker for taqueriasabrina.com
 *
 * Serves the app at the CLEAN ROOT of the domain (taqueriasabrina.com/, no
 * /OrderApp in any user-visible URL) while the files are physically hosted on
 * GitHub Pages under the project path /OrderApp/.
 *
 * The build uses base="/" so the browser only ever requests clean paths
 * (/assets/..., /logo.png, /app/queue). This worker prepends /OrderApp when it
 * fetches the GitHub Pages origin, and falls back to the SPA shell for
 * client-side routes.
 *
 * Source of truth lives here in the repo; paste into the Cloudflare dashboard
 * worker (Workers & Pages -> the worker on taqueriasabrina.com/* -> Edit code).
 */
export default {
  async fetch(request) {
    const ORIGIN = "https://taqueria-sabrina.github.io";
    const PREFIX = "/OrderApp"; // where GitHub Pages actually hosts the files
    const url = new URL(request.url);

    // Map the clean domain path to the Pages origin path.
    const originUrl = ORIGIN + PREFIX + url.pathname + url.search;

    // A real file has an extension (.js/.css/.png/...); anything else is an SPA
    // navigation route handled client-side by react-router.
    const isAsset = /\.[a-zA-Z0-9]+$/.test(url.pathname);

    let res = await fetch(originUrl, {
      headers: request.headers,
      cf: { cacheEverything: true },
    });

    // SPA fallback: unknown non-asset path -> serve the app shell (404.html is a
    // build-time copy of index.html) so client-side routing takes over.
    if (res.status === 404 && !isAsset) {
      const shell = await fetch(ORIGIN + PREFIX + "/404.html");
      return new Response(shell.body, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    // Never cache HTML (prevents serving a stale build after a deploy); hashed
    // assets keep their long-lived cache headers from Pages.
    const headers = new Headers(res.headers);
    if ((headers.get("content-type") || "").includes("text/html")) {
      headers.set("cache-control", "no-store");
    }
    return new Response(res.body, { status: res.status, headers });
  },
};
