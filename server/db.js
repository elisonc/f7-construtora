// Banco SQLite embutido do Node (node:sqlite). Um arquivo só, em data/f7.db.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export const RAIZ = path.resolve(import.meta.dirname, "..");
// F7_DADOS aponta para outra pasta de dados (ex.: a versão publicada, sem os dados de teste).
const BASE = process.env.F7_DADOS ? path.resolve(process.env.F7_DADOS) : RAIZ;
export const PASTA_DADOS = path.join(BASE, "data");
export const PASTA_ARQUIVOS = path.join(BASE, "storage");
export const PASTAS = {
  fotos: path.join(PASTA_ARQUIVOS, "fotos"),
  videos: path.join(PASTA_ARQUIVOS, "videos"),
  documentos: path.join(PASTA_ARQUIVOS, "documentos"),
  capas: path.join(PASTA_ARQUIVOS, "capas"),
};

for (const pasta of [PASTA_DADOS, ...Object.values(PASTAS)]) fs.mkdirSync(pasta, { recursive: true });

export const db = new DatabaseSync(path.join(PASTA_DADOS, "f7.db"));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    telefone TEXT,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL CHECK (papel IN ('gestor', 'cliente')),
    ativo INTEGER NOT NULL DEFAULT 1,
    trocar_senha INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    ultimo_acesso TEXT
  );

  CREATE TABLE IF NOT EXISTS sessoes (
    token_hash TEXT PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    expira_em INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS obras (
    id INTEGER PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    endereco TEXT,
    status TEXT NOT NULL DEFAULT 'em_andamento'
      CHECK (status IN ('planejamento', 'em_andamento', 'pausada', 'concluida')),
    percentual INTEGER NOT NULL DEFAULT 0,
    previsao_entrega TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS etapas (
    id INTEGER PRIMARY KEY,
    obra_id INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    nome TEXT NOT NULL,
    percentual INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS fotos (
    id INTEGER PRIMARY KEY,
    obra_id INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    arquivo TEXT NOT NULL,
    mime TEXT NOT NULL,
    legenda TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY,
    obra_id INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    nome_original TEXT NOT NULL,
    arquivo TEXT NOT NULL,
    mime TEXT NOT NULL,
    tamanho INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS empreendimentos (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    local TEXT,
    status TEXT NOT NULL DEFAULT 'lancamento'
      CHECK (status IN ('lancamento', 'em_obras', 'entregue')),
    resumo TEXT,
    descricao TEXT,
    area TEXT,
    dormitorios TEXT,
    vagas TEXT,
    capa TEXT,
    destaque INTEGER NOT NULL DEFAULT 0,
    ordem INTEGER NOT NULL DEFAULT 0,
    publicado INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Imagens editáveis do site (slides do topo, seções). Chave = lugar onde a imagem aparece.
  CREATE TABLE IF NOT EXISTS site_imagens (
    slot TEXT PRIMARY KEY,
    arquivo TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    interesse TEXT,
    mensagem TEXT,
    origem TEXT,
    status TEXT NOT NULL DEFAULT 'novo'
      CHECK (status IN ('novo', 'em_contato', 'convertido', 'descartado')),
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Acessos ao site sem cookie: o visitante é um hash diário (IP + navegador + sal do dia).
  -- O sal troca todo dia e o do dia anterior é apagado, então não dá para rastrear a pessoa.
  CREATE TABLE IF NOT EXISTS acessos (
    id INTEGER PRIMARY KEY,
    dia TEXT NOT NULL,
    caminho TEXT NOT NULL,
    visitante TEXT NOT NULL,
    origem TEXT,
    dispositivo TEXT NOT NULL,
    criado_em INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_acessos_dia ON acessos(dia);

  CREATE TABLE IF NOT EXISTS sal_diario (
    dia TEXT PRIMARY KEY,
    sal TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS logins (
    id INTEGER PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dia TEXT NOT NULL,
    criado_em INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_logins_dia ON logins(dia);
`);

// Colunas acrescentadas depois da primeira versão (bancos antigos são atualizados aqui).
for (const [coluna, tipo] of [["unidades", "TEXT"], ["entrega", "TEXT"], ["endereco", "TEXT"], ["percentual", "INTEGER"], ["orcado", "REAL"], ["gasto", "REAL"]]) {
  try {
    db.exec(`ALTER TABLE empreendimentos ADD COLUMN ${coluna} ${tipo}`);
  } catch {
    /* já existe */
  }
}

for (const [coluna, tipo] of [["orcado", "REAL"], ["gasto", "REAL"]]) {
  try {
    db.exec(`ALTER TABLE obras ADD COLUMN ${coluna} ${tipo}`);
  } catch {
    /* já existe */
  }
}

// Data local no formato AAAA-MM-DD (fuso do servidor).
export function hoje(deslocamentoDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deslocamentoDias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Recalcula o percentual geral da obra como a média das etapas.
export function recalcularObra(obraId) {
  const { media } = db
    .prepare("SELECT AVG(percentual) AS media FROM etapas WHERE obra_id = ?")
    .get(obraId);
  db.prepare("UPDATE obras SET percentual = ?, atualizado_em = datetime('now') WHERE id = ?").run(
    Math.round(media ?? 0),
    obraId
  );
}

export const ETAPAS_PADRAO = [
  "Projeto e aprovação",
  "Fundação",
  "Estrutura",
  "Alvenaria",
  "Instalações",
  "Acabamento",
  "Entrega",
];

export const CATEGORIAS_DOCUMENTO = [
  "Contrato",
  "ART",
  "RRT",
  "Alvará",
  "Projeto",
  "Levantamento topográfico",
  "Sondagem",
  "Registro de imóveis",
  "Termo de responsabilidade",
  "Habite-se",
  "Outros",
];
