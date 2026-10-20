// Utilitários HTTP sem dependências.

export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export function json(res, status, dados) {
  const corpo = JSON.stringify(dados);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "private, no-store",
    "Content-Length": Buffer.byteLength(corpo),
  });
  res.end(corpo);
}

export function lerCorpo(req, limiteBytes) {
  return new Promise((resolve, reject) => {
    const declarado = Number(req.headers["content-length"] || 0);
    if (declarado > limiteBytes) return reject(new ErroHttp(413, "Arquivo grande demais."));
    const partes = [];
    let total = 0;
    req.on("data", (parte) => {
      total += parte.length;
      if (total > limiteBytes) {
        reject(new ErroHttp(413, "Arquivo grande demais."));
        req.destroy();
        return;
      }
      partes.push(parte);
    });
    req.on("end", () => resolve(Buffer.concat(partes)));
    req.on("error", reject);
  });
}

export async function lerJson(req) {
  const corpo = await lerCorpo(req, 1024 * 1024);
  if (!corpo.length) return {};
  try {
    return JSON.parse(corpo.toString("utf8"));
  } catch {
    throw new ErroHttp(400, "JSON inválido.");
  }
}

export function lerCookies(req) {
  const cookies = {};
  for (const par of (req.headers.cookie || "").split(";")) {
    const i = par.indexOf("=");
    if (i < 0) continue;
    cookies[par.slice(0, i).trim()] = decodeURIComponent(par.slice(i + 1).trim());
  }
  return cookies;
}

export function ipDe(req) {
  if (process.env.CONFIAR_PROXY === "1") {
    const encaminhado = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (encaminhado) return encaminhado;
  }
  return req.socket.remoteAddress || "";
}

// Texto limpo e com tamanho máximo. Campos vazios viram null.
export function texto(valor, max = 200) {
  if (valor === undefined || valor === null) return null;
  const limpo = String(valor).trim().slice(0, max);
  return limpo || null;
}

export function inteiro(valor, min, max) {
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

// Limite simples por chave (IP, e-mail) em janela de tempo, em memória.
const janelas = new Map();
const MUITAS = "Muitas tentativas. Aguarde alguns minutos.";

export function registrarTentativa(chave, janelaMs) {
  const agora = Date.now();
  const atual = janelas.get(chave);
  if (!atual || agora - atual.inicio > janelaMs) janelas.set(chave, { inicio: agora, total: 1 });
  else atual.total += 1;
}

export function verificarLimite(chave, maximo, janelaMs) {
  const atual = janelas.get(chave);
  if (atual && Date.now() - atual.inicio <= janelaMs && atual.total >= maximo) throw new ErroHttp(429, MUITAS);
}

export function limitar(chave, maximo, janelaMs) {
  registrarTentativa(chave, janelaMs);
  const atual = janelas.get(chave);
  if (atual.total > maximo) throw new ErroHttp(429, MUITAS);
}

setInterval(() => {
  const agora = Date.now();
  for (const [chave, v] of janelas) if (agora - v.inicio > 60 * 60 * 1000) janelas.delete(chave);
}, 10 * 60 * 1000).unref();
