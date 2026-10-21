// Todas as rotas /api. Cada rota confere papel e dono do dado no servidor.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { db, PASTAS, hoje, recalcularObra, ETAPAS_PADRAO, CATEGORIAS_DOCUMENTO } from "./db.js";
import {
  ErroHttp,
  json,
  lerCorpo,
  lerJson,
  ipDe,
  texto,
  inteiro,
  limitar,
  verificarLimite,
  registrarTentativa,
} from "./http.js";
import {
  hashSenha,
  conferirSenha,
  conferirSenhaOuFalso,
  senhaTemporaria,
  validarNovaSenha,
  criarSessao,
  encerrarSessao,
  encerrarSessoesDo,
  usuarioDaSessao,
  exigirUsuario,
} from "./auth.js";
import { detectarTipo, salvar, apagar, enviarArquivo, nomeSeguro, IMAGENS, DOCUMENTOS } from "./arquivos.js";

const STATUS_OBRA = ["planejamento", "em_andamento", "pausada", "concluida"];
const STATUS_EMPREENDIMENTO = ["lancamento", "em_obras", "entregue"];
const STATUS_LEAD = ["novo", "em_contato", "convertido", "descartado"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MB = 1024 * 1024;

const rotas = [];
function rota(metodo, padrao, executar) {
  const regex = new RegExp(`^${padrao.replace(/:(\w+)/g, "(?<$1>[^/]+)")}$`);
  rotas.push({ metodo, regex, executar });
}

export async function tratarApi(req, res, url, producao) {
  try {
    const encontrada = rotas.find((r) => r.metodo === req.method && r.regex.test(url.pathname));
    if (!encontrada) throw new ErroHttp(404, "Rota não encontrada.");
    if (req.method !== "GET") verificarOrigem(req);
    const params = url.pathname.match(encontrada.regex).groups ?? {};
    await encontrada.executar({ req, res, url, params, producao });
  } catch (erro) {
    if (erro instanceof ErroHttp) return json(res, erro.status, { erro: erro.message });
    console.error(erro);
    json(res, 500, { erro: "Erro interno. Tente de novo." });
  }
}

// Bloqueia requisições de outros sites (CSRF): o navegador não envia cabeçalho
// customizado entre origens sem CORS, e este servidor não libera CORS.
function verificarOrigem(req) {
  const origem = req.headers.origin;
  if (origem) {
    let host = "";
    try {
      host = new URL(origem).host;
    } catch {
      /* origem inválida */
    }
    if (host !== req.headers.host) throw new ErroHttp(403, "Origem não permitida.");
  }
  if (req.headers["x-f7"] !== "1") throw new ErroHttp(403, "Requisição não permitida.");
}

const idNumero = (valor) => {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1) throw new ErroHttp(404, "Não encontrado.");
  return n;
};

const usuarioPublico = (u) => ({
  id: u.id,
  nome: u.nome,
  email: u.email,
  telefone: u.telefone,
  papel: u.papel,
  trocarSenha: Boolean(u.trocar_senha),
});

const temMini = (arquivo) => fs.existsSync(path.join(PASTAS.capas, arquivo.replace(/\.(\w+)$/, "-m.$1")));
const comCapa = (e) => ({
  ...e,
  capa: e.capa ? `/arquivos/capas/${e.capa}` : null,
  capaMini: e.capa ? `/arquivos/capas/${temMini(e.capa) ? e.capa.replace(/\.(\w+)$/, "-m.$1") : e.capa}` : null,
  destaque: Boolean(e.destaque),
});

function detalharObra(obra) {
  return {
    ...obra,
    etapas: db.prepare("SELECT id, nome, percentual FROM etapas WHERE obra_id = ? ORDER BY ordem").all(obra.id),
    fotos: db
      .prepare("SELECT id, legenda, criado_em FROM fotos WHERE obra_id = ? ORDER BY id DESC")
      .all(obra.id)
      .map((f) => ({ ...f, url: `/api/fotos/${f.id}` })),
    documentos: db
      .prepare(
        "SELECT id, categoria, nome_original, tamanho, criado_em FROM documentos WHERE obra_id = ? ORDER BY categoria, id DESC"
      )
      .all(obra.id)
      .map((d) => ({ ...d, url: `/api/documentos/${d.id}` })),
  };
}

function obraDoGestor(id) {
  const obra = db.prepare("SELECT * FROM obras WHERE id = ?").get(idNumero(id));
  if (!obra) throw new ErroHttp(404, "Obra não encontrada.");
  return obra;
}

function slugDe(nome) {
  const base =
    nome
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "empreendimento";
  let slug = base;
  for (let i = 2; db.prepare("SELECT 1 FROM empreendimentos WHERE slug = ?").get(slug); i++) slug = `${base}-${i}`;
  return slug;
}

function validarCliente(dados) {
  const nome = texto(dados.nome, 120);
  const email = texto(dados.email, 160)?.toLowerCase();
  if (!nome || nome.length < 2) throw new ErroHttp(400, "Informe o nome do cliente.");
  if (!email || !EMAIL.test(email)) throw new ErroHttp(400, "Informe um e-mail válido.");
  return { nome, email, telefone: texto(dados.telefone, 30) };
}

function dadosEmpreendimento(d) {
  const nome = texto(d.nome, 120);
  if (!nome) throw new ErroHttp(400, "Informe o nome do empreendimento.");
  const status = STATUS_EMPREENDIMENTO.includes(d.status) ? d.status : "lancamento";
  return {
    nome,
    local: texto(d.local, 120),
    status,
    resumo: texto(d.resumo, 280),
    descricao: texto(d.descricao, 4000),
    area: texto(d.area, 60),
    unidades: texto(d.unidades, 80),
    entrega: texto(d.entrega, 60),
    endereco: texto(d.endereco, 160),
    percentual: d.percentual === "" || d.percentual == null ? null : inteiro(d.percentual, 0, 100),
    destaque: d.destaque ? 1 : 0,
    publicado: d.publicado === false ? 0 : 1,
    ordem: inteiro(d.ordem ?? 0, 0, 999),
  };
}

// ---------- Público ----------

rota("GET", "/api/empreendimentos", ({ res }) => {
  const lista = db
    .prepare(
      `SELECT id, slug, nome, local, status, resumo, area, unidades, entrega, endereco, percentual, capa, destaque
       FROM empreendimentos WHERE publicado = 1 ORDER BY destaque DESC, ordem, id DESC`
    )
    .all();
  json(res, 200, lista.map(comCapa));
});

rota("GET", "/api/empreendimentos/:slug", ({ res, params }) => {
  const item = db.prepare("SELECT * FROM empreendimentos WHERE slug = ? AND publicado = 1").get(params.slug);
  if (!item) throw new ErroHttp(404, "Empreendimento não encontrado.");
  json(res, 200, comCapa(item));
});

rota("POST", "/api/contato", async ({ req, res }) => {
  const dados = await lerJson(req);
  if (dados.site) return json(res, 201, { ok: true }); // campo isca: robôs preenchem, pessoas não veem
  limitar(`contato:${ipDe(req)}`, 5, 10 * 60 * 1000);
  const nome = texto(dados.nome, 120);
  const email = texto(dados.email, 160);
  const telefone = texto(dados.telefone, 30);
  if (!nome || nome.length < 2) throw new ErroHttp(400, "Informe seu nome.");
  if (!email && !telefone) throw new ErroHttp(400, "Informe e-mail ou telefone para retorno.");
  if (email && !EMAIL.test(email)) throw new ErroHttp(400, "E-mail inválido.");
  db.prepare(
    "INSERT INTO leads (nome, email, telefone, interesse, mensagem, origem) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(nome, email, telefone, texto(dados.interesse, 120), texto(dados.mensagem, 2000), texto(dados.origem, 120));
  json(res, 201, { ok: true });
});

const ROBO = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor/i;

function salDoDia(dia) {
  const salvo = db.prepare("SELECT sal FROM sal_diario WHERE dia = ?").get(dia);
  if (salvo) return salvo.sal;
  const sal = crypto.randomBytes(16).toString("hex");
  db.prepare("INSERT OR IGNORE INTO sal_diario (dia, sal) VALUES (?, ?)").run(dia, sal);
  db.prepare("DELETE FROM sal_diario WHERE dia < ?").run(dia);
  return db.prepare("SELECT sal FROM sal_diario WHERE dia = ?").get(dia).sal;
}

rota("POST", "/api/metricas/visita", async ({ req, res }) => {
  const dados = await lerJson(req);
  const navegador = String(req.headers["user-agent"] || "");
  const ip = ipDe(req);
  limitar(`visita:${ip}`, 120, 60 * 1000);
  const usuario = usuarioDaSessao(req);
  const caminho = texto(dados.caminho, 200);
  if (ROBO.test(navegador) || usuario?.papel === "gestor" || !caminho?.startsWith("/")) {
    res.writeHead(204).end();
    return;
  }
  let origem = null;
  try {
    const host = new URL(String(dados.origem || "")).hostname.replace(/^www\./, "");
    if (host && host !== String(req.headers.host || "").split(":")[0]) origem = host.slice(0, 120);
  } catch {
    /* sem origem: acesso direto */
  }
  const dia = hoje();
  const visitante = crypto
    .createHash("sha256")
    .update(`${salDoDia(dia)}|${ip}|${navegador}`)
    .digest("hex")
    .slice(0, 16);
  const dispositivo = /Mobi|Android|iPhone|iPad/i.test(navegador) ? "mobile" : "desktop";
  db.prepare(
    "INSERT INTO acessos (dia, caminho, visitante, origem, dispositivo, criado_em) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(dia, caminho.split("?")[0], visitante, origem, dispositivo, Date.now());
  res.writeHead(204).end();
});

const SLOTS_IMAGEM = {
  logo: "Logomarca (PNG com fundo transparente, ou JPG)",
  "hero-1": "Slide 1 do topo",
  "hero-2": "Slide 2 do topo",
  "hero-3": "Slide 3 do topo",
  historia: "Seção Quem somos",
  "dif-1": "Destaque 1 (transparência)",
  "dif-2": "Destaque 2 (projetos modernos)",
  "dif-3": "Destaque 3 (qualidade)",
};

rota("GET", "/api/site/imagens", ({ res }) => {
  const mapa = {};
  for (const l of db.prepare("SELECT slot, arquivo FROM site_imagens").all()) {
    if (SLOTS_IMAGEM[l.slot]) mapa[l.slot] = `/arquivos/capas/${l.arquivo}`;
  }
  json(res, 200, mapa);
});

rota("GET", "/api/gestor/site/imagens", ({ req, res }) => {
  exigirUsuario(req, "gestor");
  const salvas = new Map(db.prepare("SELECT slot, arquivo FROM site_imagens").all().map((l) => [l.slot, l.arquivo]));
  json(res, 200, Object.entries(SLOTS_IMAGEM).map(([slot, nome]) => ({
    slot,
    nome,
    url: salvas.has(slot) ? `/arquivos/capas/${salvas.get(slot)}` : null,
  })));
});

rota("POST", "/api/gestor/site/imagens/:slot", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  if (!SLOTS_IMAGEM[params.slot]) throw new ErroHttp(404, "Lugar de imagem desconhecido.");
  const corpo = await lerCorpo(req, 12 * MB);
  const tipo = detectarTipo(corpo, IMAGENS);
  const arquivo = salvar("capas", corpo, tipo.ext);
  const antigo = db.prepare("SELECT arquivo FROM site_imagens WHERE slot = ?").get(params.slot);
  db.prepare("INSERT INTO site_imagens (slot, arquivo) VALUES (?, ?) ON CONFLICT(slot) DO UPDATE SET arquivo = excluded.arquivo").run(params.slot, arquivo);
  if (antigo) apagar("capas", antigo.arquivo);
  json(res, 200, { url: `/arquivos/capas/${arquivo}` });
});

rota("DELETE", "/api/gestor/site/imagens/:slot", ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const antigo = db.prepare("SELECT arquivo FROM site_imagens WHERE slot = ?").get(params.slot);
  if (antigo) {
    db.prepare("DELETE FROM site_imagens WHERE slot = ?").run(params.slot);
    apagar("capas", antigo.arquivo);
  }
  json(res, 200, { ok: true });
});

// ---------- Login e conta ----------

rota("POST", "/api/auth/entrar", async ({ req, res, producao }) => {
  const dados = await lerJson(req);
  const email = texto(dados.email, 160)?.toLowerCase() ?? "";
  const senha = typeof dados.senha === "string" ? dados.senha.slice(0, 200) : "";
  // Só tentativas erradas contam para o bloqueio.
  const chaves = [`login-ip:${ipDe(req)}`, `login-email:${email}`];
  const janela = 15 * 60 * 1000;
  chaves.forEach((chave) => verificarLimite(chave, 8, janela));
  const usuario = db.prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1").get(email);
  if (!conferirSenhaOuFalso(senha, usuario?.senha_hash)) {
    chaves.forEach((chave) => registrarTentativa(chave, janela));
    throw new ErroHttp(401, "E-mail ou senha incorretos.");
  }
  criarSessao(res, usuario.id, producao);
  json(res, 200, { usuario: usuarioPublico(usuario) });
});

rota("POST", "/api/auth/sair", ({ req, res }) => {
  encerrarSessao(req, res);
  json(res, 200, { ok: true });
});

rota("GET", "/api/auth/eu", ({ req, res }) => {
  const usuario = usuarioDaSessao(req);
  json(res, 200, { usuario: usuario ? usuarioPublico(usuario) : null });
});

rota("POST", "/api/conta/senha", async ({ req, res, producao }) => {
  const usuario = exigirUsuario(req);
  const { atual, nova } = await lerJson(req);
  const { senha_hash } = db.prepare("SELECT senha_hash FROM usuarios WHERE id = ?").get(usuario.id);
  if (typeof atual !== "string" || !conferirSenha(atual, senha_hash)) throw new ErroHttp(400, "Senha atual incorreta.");
  validarNovaSenha(nova);
  db.prepare("UPDATE usuarios SET senha_hash = ?, trocar_senha = 0 WHERE id = ?").run(hashSenha(nova), usuario.id);
  encerrarSessoesDo(usuario.id);
  criarSessao(res, usuario.id, producao, false);
  json(res, 200, { ok: true });
});

// ---------- Área do cliente ----------

rota("GET", "/api/cliente/obras", ({ req, res }) => {
  const usuario = exigirUsuario(req, "cliente");
  const obras = db
    .prepare("SELECT * FROM obras WHERE cliente_id = ? ORDER BY status = 'concluida', atualizado_em DESC")
    .all(usuario.id);
  json(res, 200, obras.map(detalharObra));
});

// Fotos e documentos: o cliente só acessa o que é da obra dele. Outro id responde 404.
function arquivoPermitido(req, tabela, id) {
  const usuario = exigirUsuario(req);
  const item = db
    .prepare(`SELECT a.*, o.cliente_id FROM ${tabela} a JOIN obras o ON o.id = a.obra_id WHERE a.id = ?`)
    .get(idNumero(id));
  if (!item || (usuario.papel !== "gestor" && item.cliente_id !== usuario.id)) {
    throw new ErroHttp(404, "Arquivo não encontrado.");
  }
  return item;
}

rota("GET", "/api/fotos/:id", ({ req, res, params }) => {
  const foto = arquivoPermitido(req, "fotos", params.id);
  enviarArquivo(res, "fotos", foto.arquivo, { mime: foto.mime, cache: "private, max-age=3600" });
});

rota("GET", "/api/documentos/:id", ({ req, res, params }) => {
  const doc = arquivoPermitido(req, "documentos", params.id);
  enviarArquivo(res, "documentos", doc.arquivo, {
    mime: doc.mime,
    cache: "private, no-store",
    nomeDownload: doc.nome_original,
  });
});

// ---------- Painel do gestor ----------

rota("GET", "/api/gestor/dashboard", ({ req, res, url }) => {
  exigirUsuario(req, "gestor");
  const pedidos = Number(url.searchParams.get("dias"));
  const dias = [7, 30, 90].includes(pedidos) ? pedidos : 30;
  const inicio = hoje(-(dias - 1));
  const inicioAnterior = hoje(-(2 * dias - 1));
  const fimAnterior = hoje(-dias);

  const porDia = new Map(
    db
      .prepare(
        "SELECT dia, COUNT(*) AS visitas, COUNT(DISTINCT visitante) AS visitantes FROM acessos WHERE dia >= ? GROUP BY dia"
      )
      .all(inicio)
      .map((linha) => [linha.dia, linha])
  );
  const serie = Array.from({ length: dias }, (_, i) => {
    const dia = hoje(i - (dias - 1));
    return { dia, visitas: porDia.get(dia)?.visitas ?? 0, visitantes: porDia.get(dia)?.visitantes ?? 0 };
  });
  const soma = (campo) => serie.reduce((total, d) => total + d[campo], 0);
  const anterior = db
    .prepare("SELECT COUNT(*) AS visitas FROM acessos WHERE dia >= ? AND dia <= ?")
    .get(inicioAnterior, fimAnterior).visitas;

  const clientes = db
    .prepare(
      `SELECT COUNT(*) AS total, COALESCE(SUM(ativo), 0) AS ativos,
         COALESCE(SUM(CASE WHEN date(criado_em, 'localtime') >= ? THEN 1 ELSE 0 END), 0) AS novos
       FROM usuarios WHERE papel = 'cliente'`
    )
    .get(inicio);
  const acessosClientes = db
    .prepare(
      `SELECT COUNT(*) AS logins, COUNT(DISTINCT l.usuario_id) AS clientes
       FROM logins l JOIN usuarios u ON u.id = l.usuario_id
       WHERE u.papel = 'cliente' AND l.dia >= ?`
    )
    .get(inicio);
  const obras = db
    .prepare(
      `SELECT COUNT(*) AS total,
         COALESCE(SUM(status = 'em_andamento'), 0) AS andamento,
         COALESCE(SUM(status = 'concluida'), 0) AS concluidas,
         ROUND(AVG(CASE WHEN status != 'concluida' THEN percentual END)) AS mediaProgresso
       FROM obras`
    )
    .get();
  const leads = db
    .prepare(
      `SELECT COALESCE(SUM(CASE WHEN date(criado_em, 'localtime') >= ? THEN 1 ELSE 0 END), 0) AS periodo,
         COALESCE(SUM(status = 'novo'), 0) AS novos
       FROM leads`
    )
    .get(inicio);

  json(res, 200, {
    dias,
    visitas: {
      total: soma("visitas"),
      visitantes: soma("visitantes"),
      hoje: serie.at(-1).visitas,
      periodoAnterior: anterior,
      serie,
      paginas: db
        .prepare(
          "SELECT caminho, COUNT(*) AS visitas FROM acessos WHERE dia >= ? GROUP BY caminho ORDER BY visitas DESC LIMIT 6"
        )
        .all(inicio),
      origens: db
        .prepare(
          `SELECT COALESCE(origem, 'Acesso direto') AS origem, COUNT(*) AS visitas FROM acessos
           WHERE dia >= ? GROUP BY 1 ORDER BY visitas DESC LIMIT 5`
        )
        .all(inicio),
      dispositivos: db
        .prepare("SELECT dispositivo, COUNT(*) AS visitas FROM acessos WHERE dia >= ? GROUP BY dispositivo")
        .all(inicio),
    },
    clientes: { ...clientes, ...acessosClientes },
    obras: { ...obras, mediaProgresso: obras.mediaProgresso ?? 0 },
    leads,
    ultimosClientes: db
      .prepare(
        "SELECT id, nome, email, criado_em, ultimo_acesso FROM usuarios WHERE papel = 'cliente' ORDER BY id DESC LIMIT 5"
      )
      .all(),
    ultimosLeads: db.prepare("SELECT id, nome, interesse, status, criado_em FROM leads ORDER BY id DESC LIMIT 5").all(),
  });
});

rota("GET", "/api/gestor/clientes", ({ req, res, url }) => {
  exigirUsuario(req, "gestor");
  const busca = `%${(url.searchParams.get("q") || "").trim().slice(0, 80)}%`;
  const lista = db
    .prepare(
      `SELECT u.id, u.nome, u.email, u.telefone, u.ativo, u.trocar_senha, u.criado_em, u.ultimo_acesso,
         (SELECT COUNT(*) FROM obras o WHERE o.cliente_id = u.id) AS obras
       FROM usuarios u
       WHERE u.papel = 'cliente' AND (u.nome LIKE ? OR u.email LIKE ? OR COALESCE(u.telefone, '') LIKE ?)
       ORDER BY u.ativo DESC, u.nome COLLATE NOCASE`
    )
    .all(busca, busca, busca);
  json(res, 200, lista);
});

rota("POST", "/api/gestor/clientes", async ({ req, res }) => {
  exigirUsuario(req, "gestor");
  const dados = await lerJson(req);
  const cliente = validarCliente(dados);
  if (db.prepare("SELECT 1 FROM usuarios WHERE email = ?").get(cliente.email)) {
    throw new ErroHttp(409, "Já existe um cadastro com esse e-mail.");
  }
  let senha = dados.senha ? String(dados.senha) : "";
  const gerada = !senha;
  if (gerada) senha = senhaTemporaria();
  else validarNovaSenha(senha);
  const { lastInsertRowid } = db
    .prepare(
      "INSERT INTO usuarios (nome, email, telefone, senha_hash, papel, trocar_senha) VALUES (?, ?, ?, ?, 'cliente', 1)"
    )
    .run(cliente.nome, cliente.email, cliente.telefone, hashSenha(senha));
  json(res, 201, { id: Number(lastInsertRowid), senhaTemporaria: gerada ? senha : null });
});

rota("PUT", "/api/gestor/clientes/:id", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const id = idNumero(params.id);
  const atual = db.prepare("SELECT * FROM usuarios WHERE id = ? AND papel = 'cliente'").get(id);
  if (!atual) throw new ErroHttp(404, "Cliente não encontrado.");
  const dados = await lerJson(req);
  const cliente = validarCliente({ ...atual, ...dados });
  const outro = db.prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?").get(cliente.email, id);
  if (outro) throw new ErroHttp(409, "Já existe um cadastro com esse e-mail.");
  const ativo = dados.ativo === undefined ? atual.ativo : dados.ativo ? 1 : 0;
  db.prepare("UPDATE usuarios SET nome = ?, email = ?, telefone = ?, ativo = ? WHERE id = ?").run(
    cliente.nome,
    cliente.email,
    cliente.telefone,
    ativo,
    id
  );
  if (!ativo) encerrarSessoesDo(id);
  json(res, 200, { ok: true });
});

rota("POST", "/api/gestor/clientes/:id/senha", ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const id = idNumero(params.id);
  if (!db.prepare("SELECT 1 FROM usuarios WHERE id = ? AND papel = 'cliente'").get(id)) {
    throw new ErroHttp(404, "Cliente não encontrado.");
  }
  const senha = senhaTemporaria();
  db.prepare("UPDATE usuarios SET senha_hash = ?, trocar_senha = 1 WHERE id = ?").run(hashSenha(senha), id);
  encerrarSessoesDo(id);
  json(res, 200, { senhaTemporaria: senha });
});

rota("GET", "/api/gestor/obras", ({ req, res }) => {
  exigirUsuario(req, "gestor");
  const lista = db
    .prepare(
      `SELECT o.*, u.nome AS cliente_nome,
         (SELECT COUNT(*) FROM fotos f WHERE f.obra_id = o.id) AS total_fotos,
         (SELECT COUNT(*) FROM documentos d WHERE d.obra_id = o.id) AS total_documentos
       FROM obras o JOIN usuarios u ON u.id = o.cliente_id
       ORDER BY o.status = 'concluida', o.atualizado_em DESC`
    )
    .all();
  json(res, 200, lista);
});

function dadosObra(d, atual = {}) {
  const nome = texto(d.nome ?? atual.nome, 120);
  if (!nome) throw new ErroHttp(400, "Informe o nome da obra.");
  const clienteId = Number(d.cliente_id ?? atual.cliente_id);
  if (!db.prepare("SELECT 1 FROM usuarios WHERE id = ? AND papel = 'cliente'").get(clienteId)) {
    throw new ErroHttp(400, "Escolha um cliente.");
  }
  const previsao = texto(d.previsao_entrega, 10);
  if (previsao && !/^\d{4}-\d{2}(-\d{2})?$/.test(previsao)) throw new ErroHttp(400, "Data de previsão inválida.");
  return {
    nome,
    cliente_id: clienteId,
    endereco: texto(d.endereco, 200),
    status: STATUS_OBRA.includes(d.status) ? d.status : atual.status ?? "em_andamento",
    previsao_entrega: previsao,
  };
}

rota("POST", "/api/gestor/obras", async ({ req, res }) => {
  exigirUsuario(req, "gestor");
  const o = dadosObra(await lerJson(req));
  const { lastInsertRowid } = db
    .prepare("INSERT INTO obras (cliente_id, nome, endereco, status, previsao_entrega) VALUES (?, ?, ?, ?, ?)")
    .run(o.cliente_id, o.nome, o.endereco, o.status, o.previsao_entrega);
  const id = Number(lastInsertRowid);
  const inserir = db.prepare("INSERT INTO etapas (obra_id, ordem, nome, percentual) VALUES (?, ?, ?, 0)");
  ETAPAS_PADRAO.forEach((nome, i) => inserir.run(id, i, nome));
  json(res, 201, { id });
});

rota("GET", "/api/gestor/obras/:id", ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const obra = obraDoGestor(params.id);
  json(res, 200, { ...detalharObra(obra), categorias: CATEGORIAS_DOCUMENTO });
});

rota("PUT", "/api/gestor/obras/:id", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const atual = obraDoGestor(params.id);
  const dados = await lerJson(req);
  const o = dadosObra(dados, atual);
  db.prepare(
    "UPDATE obras SET nome = ?, cliente_id = ?, endereco = ?, status = ?, previsao_entrega = ?, atualizado_em = datetime('now') WHERE id = ?"
  ).run(o.nome, o.cliente_id, o.endereco, o.status, o.previsao_entrega, atual.id);
  if (Array.isArray(dados.etapas)) {
    const etapas = dados.etapas
      .slice(0, 30)
      .map((e) => ({ nome: texto(e.nome, 80), percentual: inteiro(e.percentual, 0, 100) }))
      .filter((e) => e.nome);
    db.exec("BEGIN");
    try {
      db.prepare("DELETE FROM etapas WHERE obra_id = ?").run(atual.id);
      const inserir = db.prepare("INSERT INTO etapas (obra_id, ordem, nome, percentual) VALUES (?, ?, ?, ?)");
      etapas.forEach((e, i) => inserir.run(atual.id, i, e.nome, e.percentual));
      db.exec("COMMIT");
    } catch (erro) {
      db.exec("ROLLBACK");
      throw erro;
    }
    recalcularObra(atual.id);
  }
  json(res, 200, { ok: true });
});

rota("DELETE", "/api/gestor/obras/:id", ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const obra = obraDoGestor(params.id);
  for (const f of db.prepare("SELECT arquivo FROM fotos WHERE obra_id = ?").all(obra.id)) apagar("fotos", f.arquivo);
  for (const d of db.prepare("SELECT arquivo FROM documentos WHERE obra_id = ?").all(obra.id)) {
    apagar("documentos", d.arquivo);
  }
  db.prepare("DELETE FROM obras WHERE id = ?").run(obra.id);
  json(res, 200, { ok: true });
});

rota("POST", "/api/gestor/obras/:id/fotos", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const obra = obraDoGestor(params.id);
  const corpo = await lerCorpo(req, 12 * MB);
  const tipo = detectarTipo(corpo, IMAGENS);
  const arquivo = salvar("fotos", corpo, tipo.ext);
  const legenda = nomeSeguro(req.headers["x-legenda"], "").slice(0, 140) || null;
  const { lastInsertRowid } = db
    .prepare("INSERT INTO fotos (obra_id, arquivo, mime, legenda) VALUES (?, ?, ?, ?)")
    .run(obra.id, arquivo, tipo.mime, legenda);
  db.prepare("UPDATE obras SET atualizado_em = datetime('now') WHERE id = ?").run(obra.id);
  json(res, 201, { id: Number(lastInsertRowid) });
});

rota("DELETE", "/api/gestor/fotos/:id", ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const foto = db.prepare("SELECT * FROM fotos WHERE id = ?").get(idNumero(params.id));
  if (!foto) throw new ErroHttp(404, "Foto não encontrada.");
  db.prepare("DELETE FROM fotos WHERE id = ?").run(foto.id);
  apagar("fotos", foto.arquivo);
  json(res, 200, { ok: true });
});

rota("POST", "/api/gestor/obras/:id/documentos", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const obra = obraDoGestor(params.id);
  const categoria = nomeSeguro(req.headers["x-categoria"], "");
  if (!CATEGORIAS_DOCUMENTO.includes(categoria)) throw new ErroHttp(400, "Escolha a categoria do documento.");
  const corpo = await lerCorpo(req, 25 * MB);
  const tipo = detectarTipo(corpo, DOCUMENTOS);
  const arquivo = salvar("documentos", corpo, tipo.ext);
  const nome = nomeSeguro(req.headers["x-nome-arquivo"], `${categoria}.${tipo.ext}`);
  const { lastInsertRowid } = db
    .prepare(
      "INSERT INTO documentos (obra_id, categoria, nome_original, arquivo, mime, tamanho) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(obra.id, categoria, nome, arquivo, tipo.mime, corpo.length);
  db.prepare("UPDATE obras SET atualizado_em = datetime('now') WHERE id = ?").run(obra.id);
  json(res, 201, { id: Number(lastInsertRowid) });
});

rota("DELETE", "/api/gestor/documentos/:id", ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const doc = db.prepare("SELECT * FROM documentos WHERE id = ?").get(idNumero(params.id));
  if (!doc) throw new ErroHttp(404, "Documento não encontrado.");
  db.prepare("DELETE FROM documentos WHERE id = ?").run(doc.id);
  apagar("documentos", doc.arquivo);
  json(res, 200, { ok: true });
});

rota("GET", "/api/gestor/empreendimentos", ({ req, res }) => {
  exigirUsuario(req, "gestor");
  const lista = db.prepare("SELECT * FROM empreendimentos ORDER BY destaque DESC, ordem, id DESC").all();
  json(res, 200, lista.map((e) => ({ ...comCapa(e), publicado: Boolean(e.publicado) })));
});

rota("POST", "/api/gestor/empreendimentos", async ({ req, res }) => {
  exigirUsuario(req, "gestor");
  const e = dadosEmpreendimento(await lerJson(req));
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO empreendimentos (slug, nome, local, status, resumo, descricao, area, unidades, entrega, endereco, percentual, destaque, publicado, ordem)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      slugDe(e.nome),
      e.nome,
      e.local,
      e.status,
      e.resumo,
      e.descricao,
      e.area,
      e.unidades,
      e.entrega,
      e.endereco,
      e.percentual,
      e.destaque,
      e.publicado,
      e.ordem
    );
  json(res, 201, { id: Number(lastInsertRowid) });
});

rota("PUT", "/api/gestor/empreendimentos/:id", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const id = idNumero(params.id);
  if (!db.prepare("SELECT 1 FROM empreendimentos WHERE id = ?").get(id)) {
    throw new ErroHttp(404, "Empreendimento não encontrado.");
  }
  const e = dadosEmpreendimento(await lerJson(req));
  db.prepare(
    `UPDATE empreendimentos SET nome = ?, local = ?, status = ?, resumo = ?, descricao = ?, area = ?,
       unidades = ?, entrega = ?, endereco = ?, percentual = ?, destaque = ?, publicado = ?, ordem = ? WHERE id = ?`
  ).run(e.nome, e.local, e.status, e.resumo, e.descricao, e.area, e.unidades, e.entrega, e.endereco, e.percentual, e.destaque, e.publicado, e.ordem, id);
  json(res, 200, { ok: true });
});

rota("PUT", "/api/gestor/empreendimentos/:id/andamento", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const { percentual } = await lerJson(req);
  const valor = percentual === null || percentual === "" ? null : inteiro(percentual, 0, 100);
  const { changes } = db.prepare("UPDATE empreendimentos SET percentual = ? WHERE id = ?").run(valor, idNumero(params.id));
  if (!changes) throw new ErroHttp(404, "Empreendimento não encontrado.");
  json(res, 200, { percentual: valor });
});

rota("DELETE", "/api/gestor/empreendimentos/:id", ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const item = db.prepare("SELECT * FROM empreendimentos WHERE id = ?").get(idNumero(params.id));
  if (!item) throw new ErroHttp(404, "Empreendimento não encontrado.");
  db.prepare("DELETE FROM empreendimentos WHERE id = ?").run(item.id);
  apagar("capas", item.capa);
  json(res, 200, { ok: true });
});

rota("POST", "/api/gestor/empreendimentos/:id/capa", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const item = db.prepare("SELECT * FROM empreendimentos WHERE id = ?").get(idNumero(params.id));
  if (!item) throw new ErroHttp(404, "Empreendimento não encontrado.");
  const corpo = await lerCorpo(req, 12 * MB);
  const tipo = detectarTipo(corpo, IMAGENS);
  const arquivo = salvar("capas", corpo, tipo.ext);
  db.prepare("UPDATE empreendimentos SET capa = ? WHERE id = ?").run(arquivo, item.id);
  apagar("capas", item.capa);
  json(res, 200, { capa: `/arquivos/capas/${arquivo}` });
});

rota("GET", "/api/gestor/leads", ({ req, res, url }) => {
  exigirUsuario(req, "gestor");
  const status = url.searchParams.get("status");
  const lista = STATUS_LEAD.includes(status)
    ? db.prepare("SELECT * FROM leads WHERE status = ? ORDER BY id DESC LIMIT 500").all(status)
    : db.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 500").all();
  json(res, 200, lista);
});

rota("PUT", "/api/gestor/leads/:id", async ({ req, res, params }) => {
  exigirUsuario(req, "gestor");
  const { status } = await lerJson(req);
  if (!STATUS_LEAD.includes(status)) throw new ErroHttp(400, "Status inválido.");
  const { changes } = db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, idNumero(params.id));
  if (!changes) throw new ErroHttp(404, "Contato não encontrado.");
  json(res, 200, { ok: true });
});
