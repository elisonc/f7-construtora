// Conteúdo real da F7 Engenharia Estratégica (obras entregues e em andamento), vindo do
// PDF institucional e das fotos enviadas. `npm run conteudo` carrega isto no banco.
// Tudo é editável depois em Gestor › Empreendimentos; recarregar apaga as edições destas obras.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { db, PASTAS, RAIZ } from "./db.js";

const e = (slug, nome, unidades, resumo, extra = {}) => ({ slug, nome, unidades, resumo, status: "entregue", ...extra });
const a = (slug, nome, unidades, entrega, resumo, descricao, extra = {}) => ({
  slug, nome, unidades, entrega, resumo, descricao, status: "em_obras", ...extra,
});

export const OBRAS = [
  // ---------- Em andamento ----------
  a("ibiza", "Ibiza", "63 apartamentos", "Abril de 2027", "Duas torres no Ecoville, em Curitiba, com unidades de 35 m² a 53 m².",
    "Localizado em uma região privilegiada de Curitiba, o Ecoville. Duas torres com 7 apartamentos por andar, somando 63 unidades, com opção de garden. Unidades de 2 e 3 quartos com suítes, entregues com piso porcelanato em toda a unidade. Dois elevadores, áreas comuns equipadas e mobiliadas, 2 salões de festas, lavanderia no subsolo já com as máquinas, vagas de garagem cobertas e guarita com segurança.",
    { local: "Ecoville, Curitiba/PR", area: "35 m² a 53 m²", destaque: 1 }),
  a("my-house-agua-verde", "My House Água Verde", "27 apartamentos", "Dezembro de 2028", "Torre única de 8 andares no Água Verde, com piscina aquecida e rooftop.",
    "Torre única com 8 andares, totalizando 27 apartamentos de 48 m² a 61 m², com 2 quartos sendo suíte. Hall decorado, piscina em concreto aquecida, playground no térreo, espaço fitness no rooftop, área gourmet e fireplace. Dois elevadores com biometria, piso de porcelanato em todo o apartamento, sacada com guarda-corpo em vidro e churrasqueira a carvão.",
    { local: "Água Verde, Curitiba/PR", area: "48 m² a 61 m²" }),
  a("you-reboucas", "You Rebouças", "23 apartamentos", "Março de 2029", "Torre única de 4 andares no Rebouças, com minimercado e sala de reuniões.",
    "Torre única com 4 andares e 23 apartamentos de 30 m² a 35 m², com opção de 2 quartos e garden. Elevador com biometria, vagas para motos com carregamento elétrico, sala de reuniões, minimercado, lavanderia e bicicletário. Piso de porcelanato em todo o apartamento, sacada com guarda-corpo em vidro e churrasqueira a gás em algumas unidades.",
    { local: "Rebouças, Curitiba/PR", area: "30 m² a 35 m²" }),
  a("my-house-campos-sales", "My House Campos Sales", "55 apartamentos", "Abril de 2029", "Torre única de 9 andares na Rua Campos Sales, com coworking e academia.",
    "Localizado na Rua Campos Sales, em Curitiba/PR. Torre única com 9 andares e 55 apartamentos de 30 m² a 36 m². Coworking, lavanderia coletiva, área gourmet, minimercado, academia e pet place. Dois elevadores com biometria, piso de porcelanato em todo o apartamento, sacada com guarda-corpo em vidro e churrasqueira a carvão.",
    { local: "Campos Sales, Curitiba/PR", area: "30 m² a 36 m²" }),
  a("ravello-beach-home", "Ravello Beach Home", "Apartamentos de 2 e 3 quartos", "Dezembro de 2029", "A cerca de 500 m da Praia Central de Guaratuba, com piscina aquecida e rooftop.",
    "Localizado no centro de Guaratuba/PR, a aproximadamente 500 m da beira-mar (Praia Central). Apartamentos de 2 e 3 quartos com opção de 2 suítes. Hall de entrada com pé-direito duplo, espaço box no térreo, piscina em concreto aquecida com prainha, duchas pós-praia, playground, salão de festas, sala de jogos e brinquedoteca no primeiro andar, área gourmet, fireplace e espaço fitness no rooftop. Dois elevadores com biometria.",
    { local: "Guaratuba/PR" }),

  // ---------- Concluídas (últimas entregas) ----------
  e("santorini", "Santorini", "96 apartamentos", "Duas torres de 8 andares, de 44 m² a 56 m², com unidades garden no térreo.",
    { entrega: "Junho de 2026", local: "Curitiba/PR", area: "44 m² a 56 m²", destaque: 1,
      descricao: "Duas torres com 8 andares cada, totalizando 96 unidades de 44 m² a 56 m², com opção de suíte. Todas as unidades térreas são garden. Sacada com churrasqueira, 2 salões de festas, 2 playgrounds, academia e área de convívio no terraço, 2 elevadores e possibilidade de 2 vagas de garagem." }),
  e("capri", "Capri", "56 apartamentos", "Torre de 8 andares no Pinheirinho, com piscina e salão de festas no terraço.",
    { entrega: "Abril de 2025", local: "Pinheirinho, Curitiba/PR", area: "42 m² a 49 m²",
      descricao: "Torre única de 8 andares, 7 apartamentos por andar, total de 56 unidades de 42 m² a 49 m². Todas com sacada com churrasqueira e banheiros com ventilação e iluminação natural. Playground, petplay, academia e salão de festas no terraço, piscina, elevador e 1 subsolo de garagem." }),
  e("chronos", "Chronos", "49 apartamentos", "Torre de 16 andares com academia, coworking e 2 subsolos de garagem.",
    { entrega: "Novembro de 2024", local: "Curitiba/PR", area: "43 m² a 45 m²",
      descricao: "Torre única com 16 andares e 49 unidades de 2 quartos, de 43 m² a 45 m², com lavanderia e sacada com churrasqueira a gás. Dois elevadores, academia, 2 salões de festas, playground, coworking e 2 subsolos de garagem. Piso de porcelanato em todas as áreas." }),
  e("city-village", "City Village", "37 apartamentos", "Torre de 9 andares com unidades de 2 e 3 quartos e piscina.",
    { entrega: "Maio de 2024", local: "Curitiba/PR", area: "48 m² a 116 m²",
      descricao: "Torre única com 9 andares e 37 unidades de 2 e 3 quartos, de 48 m² a 116 m², com lavanderia e sacada com churrasqueira. Salão de festas, playground, piscina, elevador e 1 subsolo de garagem. Piso de porcelanato em todas as áreas." }),

  // ---------- Concluídas (portfólio) ----------
  e("bergamo", "Bergamo", "54 apartamentos", "Condomínio de apartamentos entregue."),
  e("verona", "Verona", "72 apartamentos", "Condomínio de apartamentos entregue."),
  e("palermo", "Palermo", "108 apartamentos", "O maior condomínio do portfólio, com 108 unidades."),
  e("saint-james", "Saint James", "56 apartamentos", "Condomínio de apartamentos entregue."),
  e("siena", "Siena", "42 apartamentos", "Condomínio de apartamentos entregue."),
  e("parma", "Parma", "32 apartamentos", "Torre residencial entregue."),
  e("vicenza", "Vicenza", "61 casas", "Conjunto residencial com 61 casas."),
  e("roma", "Roma", "16 apartamentos", "Edifício de apartamentos entregue."),
  e("milao", "Milão", "16 apartamentos", "Edifício de apartamentos entregue."),
  e("napoli", "Nápoli", "16 apartamentos", "Edifício de apartamentos entregue."),
  e("modena", "Modena", "14 apartamentos", "Edifício de apartamentos entregue."),
  e("genova", "Gênova", "12 apartamentos", "Edifício de apartamentos entregue."),
  e("firenze", "Firenze", "12 apartamentos", "Edifício de apartamentos entregue."),
  e("veneza", "Veneza", "12 apartamentos", "Edifício de apartamentos entregue."),
  e("florenzano-3", "Florenzano 3", "7 casas", "Conjunto residencial entregue."),
  e("florenzano-2", "Florenzano 2", "5 casas", "Conjunto residencial entregue."),
  e("florenzano-1", "Florenzano 1", "4 casas", "Conjunto residencial entregue."),
  e("yolanda-name", "Yolanda Name", "3 casas", "Conjunto residencial entregue."),
  e("casa-420", "Casa de alto padrão 420 m²", "Residência", "Residência de alto padrão com 420 m².", { area: "420 m²" }),
  e("casa-350", "Casa de alto padrão 350 m²", "Residência", "Residência de alto padrão com 350 m².", { area: "350 m²" }),
  e("casa-220", "Casa de alto padrão 220 m²", "Residência", "Residência de alto padrão com 220 m².", { area: "220 m²" }),
  e("clinica-750", "Clínica médica 750 m²", "Obra comercial", "Obra comercial: unidade de saúde com 750 m².", { area: "750 m²", local: "Pinheirinho, Curitiba/PR" }),
];

// Imagens do topo e das seções da home (slot -> arquivo em conteudo/obras)
export const IMAGENS_SITE = {
  "hero-1": "santorini",
  "hero-2": "ibiza",
  "hero-3": "obra-nascer-do-sol",
  historia: "chronos",
  "dif-1": "my-house-agua-verde",
  "dif-2": "ravello-beach-home",
  "dif-3": "city-village-render",
};

function copiarFoto(base) {
  const origem = path.join(RAIZ, "conteudo", "obras", `${base}.jpg`);
  if (!fs.existsSync(origem)) return null;
  const nome = crypto.randomUUID();
  fs.copyFileSync(origem, path.join(PASTAS.capas, `${nome}.jpg`));
  const mini = path.join(RAIZ, "conteudo", "obras", `${base}-m.jpg`);
  if (fs.existsSync(mini)) fs.copyFileSync(mini, path.join(PASTAS.capas, `${nome}-m.jpg`));
  return `${nome}.jpg`;
}

export function carregarConteudo() {
  // limpa as capas e imagens antigas
  for (const l of db.prepare("SELECT capa FROM empreendimentos WHERE capa IS NOT NULL").all()) {
    fs.rmSync(path.join(PASTAS.capas, l.capa), { force: true });
    fs.rmSync(path.join(PASTAS.capas, l.capa.replace(/\.(\w+)$/, "-m.$1")), { force: true });
  }
  for (const l of db.prepare("SELECT arquivo FROM site_imagens").all()) fs.rmSync(path.join(PASTAS.capas, l.arquivo), { force: true });
  db.exec("DELETE FROM empreendimentos; DELETE FROM site_imagens;");

  const inserir = db.prepare(
    `INSERT INTO empreendimentos (slug, nome, local, status, resumo, descricao, area, unidades, entrega, capa, destaque, ordem, publicado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  );
  let ordem = 1;
  for (const o of OBRAS) {
    inserir.run(o.slug, o.nome, o.local ?? null, o.status, o.resumo, o.descricao ?? null, o.area ?? null, o.unidades ?? null,
      o.entrega ?? null, copiarFoto(o.slug), o.destaque ?? 0, ordem++);
  }
  const imagem = db.prepare("INSERT INTO site_imagens (slot, arquivo) VALUES (?, ?)");
  for (const [slot, base] of Object.entries(IMAGENS_SITE)) {
    const arquivo = copiarFoto(base);
    if (arquivo) imagem.run(slot, arquivo);
  }
  return { obras: OBRAS.length, imagens: Object.keys(IMAGENS_SITE).length };
}

// Execução direta: node server/conteudo.js  (use F7_DADOS=producao para o site publicado)
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  console.log("[F7] Conteúdo carregado:", carregarConteudo());
}
