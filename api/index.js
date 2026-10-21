// Entrada serverless (Vercel): API + capas. O banco vai para /tmp (somente vitrine, não persiste).
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const DADOS = "/tmp/f7";

function prepararDados() {
  if (fs.existsSync(path.join(DADOS, "data", "f7.db"))) return;
  fs.mkdirSync(path.join(DADOS, "data"), { recursive: true });
  fs.copyFileSync(path.join(RAIZ, "data", "f7.db"), path.join(DADOS, "data", "f7.db"));
  fs.cpSync(path.join(RAIZ, "storage"), path.join(DADOS, "storage"), { recursive: true });
}

prepararDados();
process.env.F7_DADOS = DADOS;

const { tratarApi } = await import("../server/api.js");
const { enviarArquivo } = await import("../server/arquivos.js");
const { json } = await import("../server/http.js");

export default async function handler(req, res) {
  try {
    res.setHeader("X-Content-Type-Options", "nosniff");
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) return await tratarApi(req, res, url, true);
    const capa = url.pathname.match(/^\/arquivos\/capas\/([a-f0-9-]+(?:-m)?\.(?:jpg|png|webp))$/);
    if (capa) {
      const mime = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[capa[1].split(".").pop()];
      return enviarArquivo(res, "capas", capa[1], { mime, cache: "public, max-age=604800" });
    }
    return json(res, 404, { erro: "Não encontrado." });
  } catch (erro) {
    if (erro.status === 404) return json(res, 404, { erro: "Não encontrado." });
    console.error(erro);
    if (!res.headersSent) json(res, 500, { erro: "Erro interno." });
  }
}
