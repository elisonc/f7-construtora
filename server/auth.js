// Senhas com scrypt e sessões em cookie HttpOnly. O banco guarda só o hash do token.
import crypto from "node:crypto";
import { db, hoje } from "./db.js";
import { ErroHttp, lerCookies } from "./http.js";

const COOKIE = "f7_sessao";
const DURACAO_MS = 7 * 24 * 60 * 60 * 1000;

export function hashSenha(senha) {
  const sal = crypto.randomBytes(16).toString("hex");
  return `scrypt:${sal}:${crypto.scryptSync(senha, sal, 64).toString("hex")}`;
}

export function conferirSenha(senha, hash) {
  if (!hash?.startsWith("scrypt:")) return false;
  const [, sal, hex] = hash.split(":");
  const calculado = crypto.scryptSync(senha, sal, 64);
  const salvo = Buffer.from(hex, "hex");
  return calculado.length === salvo.length && crypto.timingSafeEqual(calculado, salvo);
}

// Hash fixo para gastar o mesmo tempo quando o e-mail não existe.
const HASH_FALSO = hashSenha(crypto.randomBytes(12).toString("hex"));
export function conferirSenhaOuFalso(senha, hash) {
  return conferirSenha(senha, hash || HASH_FALSO) && Boolean(hash);
}

export function senhaTemporaria() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  return Array.from(bytes, (b) => letras[b % letras.length]).join("");
}

export function validarNovaSenha(senha) {
  if (typeof senha !== "string" || senha.length < 8) {
    throw new ErroHttp(400, "A senha precisa ter pelo menos 8 caracteres.");
  }
  if (senha.length > 200) throw new ErroHttp(400, "Senha longa demais.");
}

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export function criarSessao(res, usuarioId, producao, registrarLogin = true) {
  const token = crypto.randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessoes (token_hash, usuario_id, expira_em) VALUES (?, ?, ?)").run(
    hashToken(token),
    usuarioId,
    Date.now() + DURACAO_MS
  );
  if (registrarLogin) {
    db.prepare("UPDATE usuarios SET ultimo_acesso = datetime('now') WHERE id = ?").run(usuarioId);
    db.prepare("INSERT INTO logins (usuario_id, dia, criado_em) VALUES (?, ?, ?)").run(usuarioId, hoje(), Date.now());
  }
  const seguro = producao ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DURACAO_MS / 1000}${seguro}`
  );
}

export function encerrarSessao(req, res) {
  const token = lerCookies(req)[COOKIE];
  if (token) db.prepare("DELETE FROM sessoes WHERE token_hash = ?").run(hashToken(token));
  res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export function usuarioDaSessao(req) {
  const token = lerCookies(req)[COOKIE];
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT u.id, u.nome, u.email, u.telefone, u.papel, u.trocar_senha
         FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
         WHERE s.token_hash = ? AND s.expira_em > ? AND u.ativo = 1`
      )
      .get(hashToken(token), Date.now()) ?? null
  );
}

export function exigirUsuario(req, papel) {
  const usuario = usuarioDaSessao(req);
  if (!usuario) throw new ErroHttp(401, "Faça login para continuar.");
  if (papel && usuario.papel !== papel) throw new ErroHttp(403, "Acesso não permitido.");
  return usuario;
}

export function encerrarSessoesDo(usuarioId) {
  db.prepare("DELETE FROM sessoes WHERE usuario_id = ?").run(usuarioId);
}

setInterval(() => {
  db.prepare("DELETE FROM sessoes WHERE expira_em < ?").run(Date.now());
}, 60 * 60 * 1000).unref();
