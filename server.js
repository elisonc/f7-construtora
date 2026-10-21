// Servidor único: API + site. Em dev usa o Vite como middleware (com HMR);
// com --prod serve a pasta dist/ gerada por `npm run build`.
import http from "node:http";
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import { RAIZ } from "./server/db.js";
import { tratarApi } from "./server/api.js";
import { enviarArquivo } from "./server/arquivos.js";
import { json } from "./server/http.js";
import "./server/seed.js";

const PRODUCAO = process.argv.includes("--prod");
const PORTA = Number(process.env.PORT) || 5196;
const DIST = path.join(RAIZ, "dist");
const COMPRIMIVEL = new Set([".html", ".js", ".css", ".svg", ".json", ".txt", ".webmanifest"]);
const cacheGzip = new Map();

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function cabecalhosSeguranca(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (PRODUCAO) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; " +
        "script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    );
  }
}

function servirDist(req, res, url) {
  let caminho = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
  if (!caminho.startsWith(DIST)) caminho = DIST;
  let arquivo = caminho;
  if (!fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) arquivo = path.join(DIST, "index.html");
  if (!fs.existsSync(arquivo)) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Rode `npm run build` antes de `npm start`.");
    return;
  }
  const ext = path.extname(arquivo);
  const imutavel = url.pathname.startsWith("/assets/");
  const imagem = url.pathname.startsWith("/fotos/") || url.pathname.startsWith("/cenas/");
  const cabecalhos = {
    "Content-Type": TIPOS[ext] || "application/octet-stream",
    "Cache-Control": imutavel ? "public, max-age=31536000, immutable" : imagem ? "public, max-age=604800" : "no-cache",
    Vary: "Accept-Encoding",
  };
  // Texto (js, css, html, svg, json) vai comprimido: cai para cerca de um quarto do tamanho.
  if (COMPRIMIVEL.has(ext) && /gzip/.test(String(req.headers["accept-encoding"] || ""))) {
    const chave = `${arquivo}:${fs.statSync(arquivo).mtimeMs}`;
    let corpo = cacheGzip.get(chave);
    if (!corpo) {
      corpo = zlib.gzipSync(fs.readFileSync(arquivo), { level: 9 });
      cacheGzip.set(chave, corpo);
    }
    res.writeHead(200, { ...cabecalhos, "Content-Encoding": "gzip", "Content-Length": corpo.length });
    res.end(corpo);
    return;
  }
  res.writeHead(200, cabecalhos);
  fs.createReadStream(arquivo).pipe(res);
}

const servidor = http.createServer();

let vite = null;
if (!PRODUCAO) {
  const { createServer } = await import("vite");
  vite = await createServer({
    root: RAIZ,
    appType: "spa",
    server: { middlewareMode: true, hmr: { server: servidor } },
  });
}

servidor.on("request", async (req, res) => {
  try {
    cabecalhosSeguranca(res);
    const url = new URL(req.url, "http://localhost");

    if (url.pathname.startsWith("/api/")) return await tratarApi(req, res, url, PRODUCAO);

    // Capas de empreendimentos são públicas (aparecem no site).
    const capa = url.pathname.match(/^\/arquivos\/capas\/([A-Za-z0-9_-]+(?:-m)?\.(?:jpg|png|webp))$/);
    if (capa) {
      const mime = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[capa[1].split(".").pop()];
      return enviarArquivo(res, "capas", capa[1], { mime, cache: "public, max-age=604800" });
    }

    if (vite) return vite.middlewares(req, res, () => res.writeHead(404).end());
    return servirDist(req, res, url);
  } catch (erro) {
    if (erro.status === 404) return json(res, 404, { erro: "Não encontrado." });
    console.error(erro);
    if (!res.headersSent) json(res, 500, { erro: "Erro interno." });
  }
});

servidor.listen(PORTA, () => {
  console.log(`F7 Construtora rodando em http://localhost:${PORTA} (${PRODUCAO ? "produção" : "desenvolvimento"})`);
});
