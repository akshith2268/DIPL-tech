import { createReadStream, existsSync } from "node:fs";
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
  const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const requested = resolve(join(root, cleanPath));
  const file = requested.startsWith(root) && existsSync(requested) && !requested.endsWith("\\")
    ? requested
    : join(root, "index.html");

  response.setHeader("Content-Type", mimeTypes[extname(file)] ?? "application/octet-stream");
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Local preview running at http://127.0.0.1:${port}/`);
});
