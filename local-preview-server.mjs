import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createServer } from "node:http";

const root = resolve("dist");
const port = Number(process.env.PORT ?? 5173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const hostname = (request.headers.host ?? "").split(":")[0]?.toLowerCase();

  if (hostname === "www.drithinfra.in") {
    response.writeHead(301, {
      Location: `https://drithinfra.in${url.pathname}${url.search}`,
    });
    response.end();
    return;
  }

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    response.writeHead(301, {
      Location: `${url.pathname.replace(/\/+$/, "")}${url.search}`,
    });
    response.end();
    return;
  }

  const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const requested = resolve(join(root, cleanPath));

  if (cleanPath === "_prerender" || cleanPath.startsWith("_prerender/")) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const requestedIsFile =
    requested.startsWith(root) &&
    existsSync(requested) &&
    statSync(requested).isFile();
  const prerendered = resolve(join(root, "_prerender", `${cleanPath}.html`));
  const prerenderedIsFile =
    cleanPath.length > 0 &&
    prerendered.startsWith(root) &&
    existsSync(prerendered) &&
    statSync(prerendered).isFile();
  const file = requestedIsFile
    ? requested
    : prerenderedIsFile
      ? prerendered
      : join(root, "index.html");

  response.setHeader("Content-Type", mimeTypes[extname(file)] ?? "application/octet-stream");
  if (extname(file) === ".html") {
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
    response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Local preview running at http://127.0.0.1:${port}/`);
});
