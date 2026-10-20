// Dados iniciais. Roda sozinho quando o banco está vazio (importado pelo server.js)
// e pode ser refeito com `npm run seed` (apaga tudo e recria os dados de exemplo).
//
// CREDENCIAIS DE TESTE (só em desenvolvimento). Troque antes de publicar:
//   Gestor:  gestor@f7construtora.local  /  F7-Gestor-2026
//   Cliente: cliente@exemplo.local       /  Cliente-2026
//
// Em produção (--prod) não há dados de exemplo: só o gestor, com e-mail e senha de
// F7_EMAIL_GESTOR e F7_SENHA_GESTOR. Sem a variável, a senha é gerada e aparece uma vez no console.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { db, PASTAS, recalcularObra, ETAPAS_PADRAO } from "./db.js";
import { hashSenha } from "./auth.js";
import { carregarConteudo } from "./conteudo.js";

const TESTE = {
  gestor: { nome: "Gestor F7", email: "gestor@f7construtora.local", senha: "F7-Gestor-2026" },
  cliente: { nome: "Cliente de Exemplo", email: "cliente@exemplo.local", senha: "Cliente-2026" },
};

const producao = process.argv.includes("--prod");
const executadoDireto = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;

function limparTudo() {
  db.exec(`
    DELETE FROM sessoes; DELETE FROM logins; DELETE FROM acessos; DELETE FROM sal_diario;
    DELETE FROM documentos; DELETE FROM fotos; DELETE FROM etapas; DELETE FROM obras;
    DELETE FROM leads; DELETE FROM empreendimentos; DELETE FROM usuarios;
  `);
  for (const pasta of Object.values(PASTAS)) {
    for (const arquivo of fs.readdirSync(pasta)) fs.rmSync(path.join(pasta, arquivo), { force: true });
  }
}

function inserirUsuario({ nome, email, senha }, papel, extra = {}) {
  const { lastInsertRowid } = db
    .prepare("INSERT INTO usuarios (nome, email, telefone, senha_hash, papel) VALUES (?, ?, ?, ?, ?)")
    .run(nome, email, extra.telefone ?? null, hashSenha(senha), papel);
  return Number(lastInsertRowid);
}

// Ilustração no estilo do logo (barras verticais sobre um arco) para fotos de exemplo.
function ilustracao(titulo, semente) {
  let s = semente;
  const aleatorio = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const barras = Array.from({ length: 14 }, (_, i) => {
    const centro = 1 - Math.abs(i - 6.5) / 7;
    const altura = 120 + centro * 260 + aleatorio() * 60;
    const x = 300 + i * 44;
    const cor = i % 3 === 0 ? "#f5f8fa" : i % 3 === 1 ? "#8fc0dc" : "#4f8fb4";
    return `<rect x="${x}" y="${560 - altura}" width="26" height="${altura}" fill="${cor}" opacity="0.9"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1c28"/><stop offset="1" stop-color="#040608"/></linearGradient></defs>
  <rect width="1200" height="800" fill="url(#g)"/>${barras}
  <path d="M120 565 Q600 530 1080 565" stroke="#6aaacb" stroke-width="4" fill="none"/>
  <text x="600" y="680" fill="#f5f8fa" font-family="Arial, sans-serif" font-size="40" text-anchor="middle">${titulo}</text>
  <text x="600" y="730" fill="#8fc0dc" font-family="Arial, sans-serif" font-size="24" text-anchor="middle">Foto de exemplo — substitua no painel do gestor</text>
</svg>`;
}

// PDF mínimo de uma página, para testar downloads.
function pdfSimples(titulo, linhas) {
  const escapar = (t) => t.replace(/[\\()]/g, "\\$&");
  const conteudo = [
    `BT /F1 20 Tf 72 760 Td (${escapar(titulo)}) Tj ET`,
    ...linhas.map((linha, i) => `BT /F1 12 Tf 72 ${720 - i * 20} Td (${escapar(linha)}) Tj ET`),
  ].join("\n");
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(conteudo, "latin1")} >>\nstream\n${conteudo}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const posicoes = [];
  objetos.forEach((objeto, i) => {
    posicoes.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf +=
    `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n` +
    posicoes.map((p) => `${String(p).padStart(10, "0")} 00000 n \n`).join("") +
    `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

function salvarExemplo(pasta, conteudo, ext) {
  const nome = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(PASTAS[pasta], nome), conteudo);
  return nome;
}

export function semearEmpreendimentos() {
  const inserirEmp = db.prepare(
    `INSERT INTO empreendimentos (slug, nome, local, status, resumo, descricao, area, dormitorios, vagas, destaque, ordem)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const descricao =
    "Texto de exemplo. Descreva aqui a localização, o projeto, as áreas comuns e os diferenciais do empreendimento. " +
    "Tudo isso é editado no painel do gestor, em Empreendimentos.";
  inserirEmp.run("residencial-aurora", "Residencial Aurora", "Centro", "lancamento",
    "Apartamentos de 2 e 3 dormitórios com lazer completo.", descricao, "68 a 112 m²", "2 e 3", "1 a 2", 1, 1);
  inserirEmp.run("casas-vila-serena", "Casas Vila Serena", "Zona Sul", "em_obras",
    "Casas de 3 suítes em condomínio fechado, com área verde.", descricao, "140 a 210 m²", "3", "2 a 3", 0, 2);
  inserirEmp.run("edificio-atlantico", "Edifício Atlântico", "Av. Principal", "em_obras",
    "Unidades de 1 a 3 dormitórios perto de tudo.", descricao, "45 a 98 m²", "1 a 3", "1", 0, 3);
  inserirEmp.run("condominio-bosque-verde", "Condomínio Bosque Verde", "Zona Norte", "entregue",
    "Torres com lazer completo e muito verde, já entregue.", descricao, "70 a 120 m²", "2 e 3", "1 a 2", 0, 4);
  inserirEmp.run("torre-prisma", "Torre Prisma", "Centro Empresarial", "lancamento",
    "Salas comerciais com infraestrutura moderna.", descricao, "32 a 80 m²", "—", "1", 0, 5);
}

function semearProducao() {
  const email = process.env.F7_EMAIL_GESTOR || TESTE.gestor.email;
  const senha = process.env.F7_SENHA_GESTOR || crypto.randomBytes(9).toString("base64url");
  inserirUsuario({ nome: "Gestor F7", email, senha }, "gestor");
  carregarConteudo(); // obras reais da F7, editáveis no painel
  if (!process.env.F7_SENHA_GESTOR) {
    console.log(`\n[F7] Gestor criado: ${email}\n[F7] Senha inicial (anote, não aparece de novo): ${senha}\n`);
  }
}

function semearDesenvolvimento() {
  inserirUsuario(TESTE.gestor, "gestor");
  const clienteId = inserirUsuario(TESTE.cliente, "cliente", { telefone: "(00) 90000-0000" });
  inserirUsuario({ nome: "Segundo Cliente (exemplo)", email: "segundo@exemplo.local", senha: "Cliente-2026" }, "cliente");

  const { lastInsertRowid } = db
    .prepare("INSERT INTO obras (cliente_id, nome, endereco, status, previsao_entrega) VALUES (?, ?, ?, ?, ?)")
    .run(clienteId, "Casa Lote 12 — Residencial Exemplo", "Rua Exemplo, 123 — Cidade/UF", "em_andamento", "2027-03");
  const obraId = Number(lastInsertRowid);
  const progresso = [100, 100, 85, 60, 35, 10, 0];
  const inserirEtapa = db.prepare("INSERT INTO etapas (obra_id, ordem, nome, percentual) VALUES (?, ?, ?, ?)");
  ETAPAS_PADRAO.forEach((nome, i) => inserirEtapa.run(obraId, i, nome, progresso[i]));
  recalcularObra(obraId);

  // Fotos de exemplo: etapas da obra (fundação → estrutura → alvenaria → acabamento).
  const fotos = [
    ["Armação da fundação", "fundacao"],
    ["Estrutura em concreto", "obra-estrutura"],
    ["Guindaste na obra", "guindastes"],
    ["Alvenaria e telhado", "casa-obra"],
    ["Torres em construção", "predio-obra"],
    ["Acabamento da fachada", "predio-pronto"],
  ];
  const inserirFoto = db.prepare("INSERT INTO fotos (obra_id, arquivo, mime, legenda) VALUES (?, ?, 'image/jpeg', ?)");
  for (const [legenda, nome] of fotos) {
    const jpg = fs.readFileSync(path.join(import.meta.dirname, "..", "public", "fotos", `${nome}.jpg`));
    inserirFoto.run(obraId, salvarExemplo("fotos", jpg, "jpg"), legenda);
  }

  const inserirDoc = db.prepare(
    "INSERT INTO documentos (obra_id, categoria, nome_original, arquivo, mime, tamanho) VALUES (?, ?, ?, ?, 'application/pdf', ?)"
  );
  for (const categoria of ["Contrato", "ART", "Alvará", "Projeto"]) {
    const pdf = pdfSimples(`${categoria} — documento de exemplo`, [
      "F7 Construtora",
      "Casa Lote 12 — Residencial Exemplo",
      "Este arquivo é só um exemplo para testar o download.",
      "Envie o documento real pelo painel do gestor.",
    ]);
    inserirDoc.run(obraId, categoria, `${categoria} - exemplo.pdf`, salvarExemplo("documentos", pdf, "pdf"), pdf.length);
  }

  carregarConteudo();

  const inserirLead = db.prepare("INSERT INTO leads (nome, email, telefone, interesse, mensagem, origem) VALUES (?, ?, ?, ?, ?, ?)");
  inserirLead.run("Contato de exemplo", "contato@exemplo.local", "(00) 90000-0001", "Residencial Aurora",
    "Mensagem de exemplo para testar a lista de contatos.", "Formulário do site");
}

export function semear() {
  if (producao) semearProducao();
  else semearDesenvolvimento();
}

if (executadoDireto) {
  if (process.argv.includes("--reset")) limparTudo();
  if (!db.prepare("SELECT 1 FROM usuarios LIMIT 1").get()) semear();
  console.log("[F7] Dados prontos.");
} else if (!db.prepare("SELECT 1 FROM usuarios LIMIT 1").get()) {
  semear();
}
