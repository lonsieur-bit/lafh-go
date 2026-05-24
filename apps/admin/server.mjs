/**
 * Production static server for the admin SPA (CloudPanel / Node.js site).
 * Listens on process.env.PORT (panel sets this, e.g. 3094).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT) || 3094;
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "") || "index.html";
  const resolved = path.normalize(path.join(DIST, rel));
  if (!resolved.startsWith(DIST)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    return send(res, 200, "ok", "text/plain; charset=utf-8");
  }

  const filePath = safePath(req.url ?? "/");
  if (!filePath) return send(res, 400, "Bad request");

  const tryFile = (fp) => {
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) return false;
    const ext = path.extname(fp);
    const data = fs.readFileSync(fp);
    send(res, 200, data, MIME[ext] ?? "application/octet-stream");
    return true;
  };

  if (tryFile(filePath)) return;

  const index = path.join(DIST, "index.html");
  if (fs.existsSync(index)) {
    send(res, 200, fs.readFileSync(index), MIME[".html"]);
    return;
  }

  send(res, 404, "Not found");
});

if (!fs.existsSync(DIST)) {
  console.error(`Missing dist folder: ${DIST}`);
  console.error("Upload dist/index.html and dist/assets/ next to server.mjs");
  process.exit(1);
}

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Admin panel listening on http://${HOST}:${PORT}`);
  console.log(`dist: ${DIST}`);
});
