// Arquivos enviados ficam em storage/, fora de qualquer pasta pública.
// O tipo é conferido pelos primeiros bytes, não pelo nome nem pelo cabeçalho do navegador.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PASTAS } from "./db.js";
import { ErroHttp } from "./http.js";

const ASSINATURAS = [
  { mime: "image/jpeg", ext: "jpg", confere: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    confere: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mime: "image/webp",
    ext: "webp",
    confere: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  },
  { mime: "application/pdf", ext: "pdf", confere: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  {
    mime: "video/mp4",
    ext: "mp4",
    confere: (b) => {
      const ftyp = b.subarray(4, 8).toString("latin1");
      return ftyp === "ftyp" || ftyp === "moov" || b.subarray(4, 12).toString("latin1") === "ftypmp4" ||
        ["isom", "mp42", "mp41", "avc1", "M4V ", "M4A "].some((s) => b.subarray(8, 12).toString("latin1") === s);
    },
  },
  {
    mime: "video/quicktime",
    ext: "mov",
    confere: (b) => b.subarray(4, 8).toString("latin1") === "ftyp" &&
      b.subarray(8, 12).toString("latin1") === "qt  ",
  },
];

export const IMAGENS = ["image/jpeg", "image/png", "image/webp"];
export const VIDEOS = ["video/mp4", "video/quicktime"];
export const MIDIA = [...IMAGENS, ...VIDEOS];
export const DOCUMENTOS = ["application/pdf", "image/jpeg", "image/png"];

export function detectarTipo(buffer, permitidos) {
  if (!buffer.length) throw new ErroHttp(400, "Arquivo vazio.");
  const tipo = ASSINATURAS.find((t) => t.confere(buffer));
  if (!tipo || !permitidos.includes(tipo.mime)) throw new ErroHttp(415, "Tipo de arquivo não aceito.");
  return tipo;
}

export function salvar(pasta, buffer, ext) {
  const nome = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(PASTAS[pasta], nome), buffer);
  return nome;
}

export function apagar(pasta, nome) {
  if (!nome) return;
  fs.rm(path.join(PASTAS[pasta], path.basename(nome)), { force: true }, () => {});
}

export function enviarArquivo(res, pasta, nome, { mime, cache, nomeDownload }) {
  const caminho = path.join(PASTAS[pasta], path.basename(nome));
  let tamanho;
  try {
    tamanho = fs.statSync(caminho).size;
  } catch {
    throw new ErroHttp(404, "Arquivo não encontrado.");
  }
  const cabecalhos = {
    "Content-Type": mime,
    "Content-Length": tamanho,
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  };
  if (nomeDownload) {
    cabecalhos["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(nomeDownload)}`;
  }
  res.writeHead(200, cabecalhos);
  fs.createReadStream(caminho).pipe(res);
}

// Nome original só para exibição e download. Nunca é usado como caminho no disco.
export function nomeSeguro(bruto, padrao) {
  let nome = padrao;
  try {
    nome = decodeURIComponent(String(bruto || "")) || padrao;
  } catch {
    nome = padrao;
  }
  nome = path.basename(nome).replace(/[\u0000-\u001f\u007f"\\/<>:|?*]/g, "").trim();
  return (nome || padrao).slice(0, 120);
}
