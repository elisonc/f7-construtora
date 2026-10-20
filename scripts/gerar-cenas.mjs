// Gera as ilustrações de imóveis (SVG) usadas como imagens padrão do site e da área do cliente.
// Rodar: node scripts/gerar-cenas.mjs   →   public/cenas/*.svg
// São ilustrações, não fotos: as fotos reais entram em Gestor › Imagens do site e nas obras.
import fs from "node:fs";
import path from "node:path";

const SAIDA = path.resolve(import.meta.dirname, "..", "public", "cenas");
fs.mkdirSync(SAIDA, { recursive: true });

const W = 1600;
const H = 1000;

function rng(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r = (n) => Math.round(n * 10) / 10;
const janelaQuente = ["#ffd9a0", "#ffc27a", "#ffb35c", "#ffe6bf"];

function base(id, corpo, { ceu = ["#050c14", "#0d2a40", "#1c5878"], brilho = "#f4b57f" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ceu[0]}"/><stop offset="0.55" stop-color="${ceu[1]}"/><stop offset="1" stop-color="${ceu[2]}"/></linearGradient>
<radialGradient id="${id}-sol" cx="0.5" cy="1" r="0.75"><stop offset="0" stop-color="${brilho}" stop-opacity="0.55"/><stop offset="0.45" stop-color="${brilho}" stop-opacity="0.12"/><stop offset="1" stop-color="${brilho}" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}-vidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a6a90"/><stop offset="0.5" stop-color="#143c58"/><stop offset="1" stop-color="#0a2236"/></linearGradient>
<linearGradient id="${id}-concreto" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d98a2"/><stop offset="1" stop-color="#5d6a76"/></linearGradient>
<linearGradient id="${id}-chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10222f"/><stop offset="1" stop-color="#04090e"/></linearGradient>
<linearGradient id="${id}-vinheta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.3" stop-color="#000" stop-opacity="0"/><stop offset="0.75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></linearGradient>
<filter id="${id}-b"><feGaussianBlur stdDeviation="6"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#${id}-ceu)"/>
<rect width="${W}" height="${H}" fill="url(#${id}-sol)"/>
${corpo}
<rect width="${W}" height="${H}" fill="url(#${id}-vinheta)"/>
</svg>`;
}

function estrelas(rand, n = 70) {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += `<circle cx="${r(rand() * W)}" cy="${r(rand() * 340)}" r="${r(0.6 + rand() * 1.2)}" fill="#fff" opacity="${r(0.2 + rand() * 0.6)}"/>`;
  }
  return s;
}

function cidadeAoFundo(rand, y, cor, alturaMax = 260) {
  let s = "";
  let x = -20;
  while (x < W) {
    const w = 40 + rand() * 90;
    const h = 70 + rand() * alturaMax;
    s += `<rect x="${r(x)}" y="${r(y - h)}" width="${r(w)}" height="${r(h + 200)}" fill="${cor}"/>`;
    for (let jy = y - h + 12; jy < y - 8; jy += 16) {
      for (let jx = x + 6; jx < x + w - 8; jx += 12) {
        if (rand() < 0.2) s += `<rect x="${r(jx)}" y="${r(jy)}" width="5" height="7" fill="${janelaQuente[(rand() * 4) | 0]}" opacity="${r(0.35 + rand() * 0.5)}"/>`;
      }
    }
    x += w + 4 + rand() * 12;
  }
  return s;
}

// Torre envidraçada com janelas acesas.
function torre(rand, id, x, y, w, h, { acesas = 0.42, colunas = 12, andar = 34, topo = "plano" } = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-vidro)"/>`;
  const lw = w / colunas;
  for (let i = 1; i < colunas; i++) s += `<rect x="${r(x + i * lw - 1)}" y="${y}" width="2" height="${h}" fill="#061522" opacity="0.7"/>`;
  for (let jy = y + 10; jy < y + h - 14; jy += andar) {
    s += `<rect x="${x}" y="${r(jy + andar - 8)}" width="${w}" height="3" fill="#061522" opacity="0.65"/>`;
    for (let c = 0; c < colunas; c++) {
      if (rand() < acesas) {
        s += `<rect x="${r(x + c * lw + 4)}" y="${r(jy + 4)}" width="${r(lw - 8)}" height="${r(andar - 18)}" fill="${janelaQuente[(rand() * 4) | 0]}" opacity="${r(0.55 + rand() * 0.45)}"/>`;
      } else if (rand() < 0.3) {
        s += `<rect x="${r(x + c * lw + 4)}" y="${r(jy + 4)}" width="${r(lw - 8)}" height="${r(andar - 18)}" fill="#8fc7ea" opacity="0.18"/>`;
      }
    }
  }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#9ed3f0" stroke-opacity="0.25"/>`;
  if (topo === "plano") s += `<rect x="${x - 4}" y="${y - 10}" width="${w + 8}" height="10" fill="#0a1e2e"/><rect x="${x + w / 2 - 2}" y="${y - 70}" width="4" height="60" fill="#0a1e2e"/><circle cx="${x + w / 2}" cy="${y - 72}" r="4" fill="#ff5a4d"/>`;
  return s;
}

function chao(id, y, extra = "") {
  return `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="url(#${id}-chao)"/>
<rect x="0" y="${y}" width="${W}" height="3" fill="#6aaacb" opacity="0.35"/>${extra}`;
}

function reflexos(rand, y, n = 22) {
  let s = "";
  for (let i = 0; i < n; i++) s += `<rect x="${r(rand() * W)}" y="${r(y + 8 + rand() * 110)}" width="${r(30 + rand() * 120)}" height="3" fill="${janelaQuente[(rand() * 4) | 0]}" opacity="${r(0.1 + rand() * 0.25)}"/>`;
  return s;
}

function guindaste(rand, x, topo, chaoY, { lanca = 640, contra = 220, carga = true } = {}) {
  let s = `<g stroke="#e8a63a" stroke-width="3" fill="none">`;
  const mw = 38;
  s += `<line x1="${x - mw / 2}" y1="${chaoY}" x2="${x - mw / 2}" y2="${topo}"/><line x1="${x + mw / 2}" y1="${chaoY}" x2="${x + mw / 2}" y2="${topo}"/>`;
  let alt = true;
  for (let yy = chaoY; yy > topo + 24; yy -= 30) {
    s += `<line x1="${alt ? x - mw / 2 : x + mw / 2}" y1="${yy}" x2="${alt ? x + mw / 2 : x - mw / 2}" y2="${yy - 30}"/>`;
    alt = !alt;
  }
  s += `<line x1="${x - contra}" y1="${topo + 8}" x2="${x + lanca}" y2="${topo + 8}" stroke-width="5"/>`;
  s += `<line x1="${x - contra}" y1="${topo + 8}" x2="${x}" y2="${topo - 56}"/><line x1="${x + lanca}" y1="${topo + 8}" x2="${x}" y2="${topo - 56}"/>`;
  for (let k = 40; k < lanca; k += 46) s += `<line x1="${x + k}" y1="${topo + 8}" x2="${x + k + 23}" y2="${topo - 18}"/><line x1="${x + k + 23}" y1="${topo - 18}" x2="${x + k + 46}" y2="${topo + 8}"/>`;
  s += `</g>`;
  s += `<rect x="${x - contra}" y="${topo + 6}" width="70" height="38" fill="#3b4652"/>`;
  s += `<circle cx="${x}" cy="${topo - 58}" r="5" fill="#ff5a4d"/><circle cx="${x + lanca}" cy="${topo + 6}" r="4" fill="#ff5a4d"/>`;
  if (carga) {
    const cx = x + lanca * 0.62;
    s += `<line x1="${cx}" y1="${topo + 10}" x2="${cx}" y2="${topo + 150}" stroke="#d0d6dc" stroke-width="2"/><rect x="${cx - 36}" y="${topo + 150}" width="72" height="26" fill="#c9d1d8"/><rect x="${cx - 36}" y="${topo + 150}" width="72" height="5" fill="#e8a63a"/>`;
  }
  return s;
}

function arvore(x, y, escala = 1, cor = "#0d3b34") {
  return `<rect x="${x - 4 * escala}" y="${y - 60 * escala}" width="${8 * escala}" height="${60 * escala}" fill="#2a1f18"/><circle cx="${x}" cy="${y - 80 * escala}" r="${46 * escala}" fill="${cor}"/><circle cx="${x - 30 * escala}" cy="${y - 62 * escala}" r="${32 * escala}" fill="${cor}"/><circle cx="${x + 32 * escala}" cy="${y - 64 * escala}" r="${34 * escala}" fill="${cor}"/>`;
}

function palmeira(x, y, escala = 1) {
  let s = `<path d="M${x} ${y} Q${x + 14 * escala} ${y - 120 * escala} ${x + 6 * escala} ${y - 220 * escala}" stroke="#3a2a1d" stroke-width="${9 * escala}" fill="none"/>`;
  const px = x + 6 * escala;
  const py = y - 220 * escala;
  for (const a of [-160, -125, -90, -55, -20, 15]) {
    const rad = (a * Math.PI) / 180;
    const ex = px + Math.cos(rad) * 110 * escala;
    const ey = py + Math.sin(rad) * 60 * escala + 40 * escala;
    s += `<path d="M${px} ${py} Q${(px + ex) / 2} ${py - 40 * escala} ${ex} ${ey}" stroke="#0f4a3a" stroke-width="${7 * escala}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

function carro(x, y, cor = "#16222c") {
  return `<path d="M${x} ${y} h210 l-14 -34 q-8 -22 -34 -22 h-70 q-26 0 -40 20 l-18 22 q-34 4 -34 14z" fill="${cor}"/><circle cx="${x + 54}" cy="${y + 2}" r="18" fill="#05090d"/><circle cx="${x + 160}" cy="${y + 2}" r="18" fill="#05090d"/><rect x="${x + 195}" y="${y - 22}" width="12" height="7" fill="#ffe2a8"/>`;
}

const cenas = {};

cenas["predio-pronto"] = () => {
  const rand = rng(11);
  const id = "pp";
  const y0 = 820;
  let s = estrelas(rand);
  s += cidadeAoFundo(rand, y0 - 40, "#0a1c2c", 300);
  s += cidadeAoFundo(rand, y0, "#081624", 200);
  s += torre(rand, id, 340, 330, 230, y0 - 330, { colunas: 6 });
  s += torre(rand, id, 1060, 260, 250, y0 - 260, { colunas: 6, acesas: 0.36 });
  s += torre(rand, id, 590, 120, 450, y0 - 120, { colunas: 11, andar: 36, acesas: 0.48 });
  s += `<rect x="440" y="${y0 - 70}" width="720" height="70" fill="#0a2236"/><rect x="450" y="${y0 - 60}" width="700" height="50" fill="#ffd9a0" opacity="0.28"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${470 + i * 76}" y="${y0 - 62}" width="4" height="52" fill="#06121d"/>`;
  s += chao(id, y0, reflexos(rand, y0));
  s += arvore(250, y0 + 10, 1.1) + arvore(1380, y0 + 8, 1.2) + arvore(1480, y0 + 14, 0.9);
  return base(id, s);
};

cenas["predio-obra"] = () => {
  const rand = rng(23);
  const id = "po";
  const y0 = 840;
  let s = estrelas(rand, 50);
  s += cidadeAoFundo(rand, y0 - 20, "#0a1c2c", 220);
  const x = 470;
  const w = 600;
  const piso = 46;
  const andares = 15;
  const topo = y0 - andares * piso;
  // pilares e lajes
  for (let a = 0; a < andares; a++) {
    const yy = y0 - (a + 1) * piso;
    const estado = a < 8 ? "pronto" : a < 11 ? "laje" : "ferragem";
    if (estado === "pronto") {
      s += `<rect x="${x}" y="${yy}" width="${w}" height="${piso}" fill="url(#${id}-vidro)"/>`;
      for (let c = 0; c < 10; c++) if (rand() < 0.45) s += `<rect x="${x + c * 60 + 8}" y="${yy + 8}" width="44" height="${piso - 18}" fill="${janelaQuente[(rand() * 4) | 0]}" opacity="0.8"/>`;
    }
    s += `<rect x="${x - 10}" y="${yy + piso - 6}" width="${w + 20}" height="8" fill="url(#${id}-concreto)"/>`;
    if (estado !== "pronto") {
      for (let c = 0; c <= 6; c++) s += `<rect x="${x + c * (w / 6) - 5}" y="${yy}" width="10" height="${piso - 6}" fill="url(#${id}-concreto)"/>`;
    }
    if (estado === "ferragem") {
      for (let c = 0; c <= 6; c++) s += `<line x1="${x + c * (w / 6)}" y1="${yy - 20}" x2="${x + c * (w / 6)}" y2="${yy}" stroke="#a8442c" stroke-width="2"/>`;
    }
  }
  // andaime e tela
  s += `<rect x="${x - 40}" y="${y0 - 8 * piso}" width="40" height="${8 * piso}" fill="#9ed3f0" opacity="0.12"/>`;
  for (let yy = y0; yy > y0 - 9 * piso; yy -= 46) s += `<line x1="${x - 40}" y1="${yy}" x2="${x}" y2="${yy}" stroke="#e8a63a" stroke-width="3"/>`;
  s += `<line x1="${x - 40}" y1="${y0}" x2="${x - 40}" y2="${y0 - 9 * piso}" stroke="#e8a63a" stroke-width="3"/>`;
  s += guindaste(rand, 1180, 90, y0, { lanca: 380, contra: 200 });
  s += `<rect x="1060" y="${y0 - 50}" width="150" height="50" fill="#e8a63a"/><rect x="1070" y="${y0 - 40}" width="40" height="22" fill="#9ed3f0" opacity="0.7"/>`;
  // holofotes
  s += `<polygon points="260,${y0 - 6} 120,${y0 - 330} 470,${y0 - 330}" fill="#ffe6bf" opacity="0.07"/>`;
  s += chao(id, y0, reflexos(rand, y0, 16));
  s += `<rect x="150" y="${y0 + 10}" width="200" height="50" fill="#e8a63a" opacity="0.9"/><rect x="150" y="${y0 + 10}" width="200" height="8" fill="#fff" opacity="0.4"/>`;
  return base(id, s);
};

cenas["fundacao"] = () => {
  const rand = rng(37);
  const id = "fu";
  const y0 = 640;
  let s = estrelas(rand, 40);
  s += cidadeAoFundo(rand, y0 - 10, "#0a1c2c", 200);
  s += `<rect x="0" y="${y0}" width="${W}" height="${H - y0}" fill="#1a1612"/>`;
  s += `<rect x="0" y="${y0}" width="${W}" height="4" fill="#d9a85a" opacity="0.5"/>`;
  // escavação
  s += `<polygon points="320,${y0} 420,${y0 + 260} 1180,${y0 + 260} 1280,${y0}" fill="#0b0907"/>`;
  s += `<polygon points="320,${y0} 420,${y0 + 260} 460,${y0 + 260} 360,${y0}" fill="#2c231b"/>`;
  // sapatas e ferragem
  for (let i = 0; i < 6; i++) {
    const px = 470 + i * 118;
    s += `<rect x="${px}" y="${y0 + 218}" width="80" height="42" fill="#8d98a2" opacity="${i < 3 ? 0.95 : 0.45}"/>`;
    s += `<g stroke="#b8532f" stroke-width="3" opacity="0.95"><line x1="${px + 14}" y1="${y0 + 218}" x2="${px + 14}" y2="${y0 + 90 - (i % 2) * 30}"/><line x1="${px + 66}" y1="${y0 + 218}" x2="${px + 66}" y2="${y0 + 90 - (i % 2) * 30}"/>`;
    for (let k = 0; k < 5; k++) s += `<line x1="${px + 14}" y1="${y0 + 205 - k * 26}" x2="${px + 66}" y2="${y0 + 205 - k * 26}"/>`;
    s += `</g>`;
  }
  s += `<rect x="440" y="${y0 + 236}" width="760" height="24" fill="#6a7580" opacity="0.7"/>`;
  s += guindaste(rand, 1340, 150, y0, { lanca: 220, contra: 160 });
  // caminhão betoneira
  s += `<rect x="120" y="${y0 - 70}" width="170" height="70" fill="#d9dee3"/><ellipse cx="236" cy="${y0 - 110}" rx="86" ry="58" fill="#e8a63a" transform="rotate(-18 236 ${y0 - 110})"/><rect x="60" y="${y0 - 56}" width="62" height="56" fill="#c9d1d8"/><circle cx="110" cy="${y0 + 4}" r="20" fill="#05090d"/><circle cx="240" cy="${y0 + 4}" r="20" fill="#05090d"/><circle cx="82" cy="${y0 + 4}" r="20" fill="#05090d"/>`;
  // trabalhadores
  for (const px of [620, 820, 990]) s += `<circle cx="${px}" cy="${y0 + 160}" r="9" fill="#e8a63a"/><rect x="${px - 8}" y="${y0 + 168}" width="16" height="42" fill="#1f2d38"/><rect x="${px - 8}" y="${y0 + 176}" width="16" height="8" fill="#ffe6bf" opacity="0.8"/>`;
  s += `<polygon points="560,${y0 - 40} 430,${y0 + 250} 700,${y0 + 250}" fill="#ffe6bf" opacity="0.08"/><polygon points="1010,${y0 - 40} 880,${y0 + 250} 1150,${y0 + 250}" fill="#ffe6bf" opacity="0.08"/>`;
  s += `<rect x="540" y="${y0 - 60}" width="6" height="60" fill="#3b4652"/><rect x="528" y="${y0 - 70}" width="30" height="14" fill="#ffe6bf"/><rect x="990" y="${y0 - 60}" width="6" height="60" fill="#3b4652"/><rect x="978" y="${y0 - 70}" width="30" height="14" fill="#ffe6bf"/>`;
  // cerca de obra
  for (let px = 0; px < W; px += 44) s += `<rect x="${px}" y="${y0 - 46}" width="40" height="46" fill="#e8a63a" opacity="${(px / 44) % 2 ? 0.85 : 0.55}"/>`;
  return base(id, s, { ceu: ["#050c14", "#0c2a40", "#23506e"] });
};

function casa(id, rand, { obra = false } = {}) {
  const y0 = 800;
  let s = estrelas(rand, 55);
  s += cidadeAoFundo(rand, y0 - 120, "#0a1c2c", 120);
  s += `<rect x="0" y="${y0 - 90}" width="${W}" height="90" fill="#0b2b24"/>`;
  s += arvore(180, y0 - 4, 1.3, "#0a3a30") + arvore(1450, y0 - 4, 1.4, "#0a3a30");
  const cor = obra ? "#8b4a35" : "#cdd5db";
  s += `<rect x="360" y="560" width="760" height="${y0 - 560}" fill="${cor}" opacity="${obra ? 0.9 : 0.92}"/>`;
  if (obra) {
    for (let yy = 560; yy < y0; yy += 18) {
      s += `<line x1="360" y1="${yy}" x2="1120" y2="${yy}" stroke="#2a1008" stroke-opacity="0.55"/>`;
      for (let xx = 360 + ((yy / 18) % 2 ? 0 : 20); xx < 1120; xx += 40) s += `<line x1="${xx}" y1="${yy}" x2="${xx}" y2="${yy + 18}" stroke="#2a1008" stroke-opacity="0.4"/>`;
    }
    s += `<polygon points="560,380 1240,380 1240,560 560,560" fill="#8b4a35" opacity="0.9"/>`;
    for (let yy = 380; yy < 560; yy += 18) s += `<line x1="560" y1="${yy}" x2="1240" y2="${yy}" stroke="#2a1008" stroke-opacity="0.5"/>`;
    // estrutura do telhado
    s += `<g stroke="#b99063" stroke-width="7" fill="none"><polyline points="540,380 900,250 1260,380"/><line x1="900" y1="250" x2="900" y2="380"/><line x1="720" y1="315" x2="720" y2="380"/><line x1="1080" y1="315" x2="1080" y2="380"/><line x1="540" y1="380" x2="1260" y2="380"/></g>`;
    // andaime
    for (let xx = 330; xx <= 1280; xx += 190) s += `<line x1="${xx}" y1="${y0}" x2="${xx}" y2="250" stroke="#e8a63a" stroke-width="4"/>`;
    for (let yy = y0 - 80; yy > 260; yy -= 110) s += `<line x1="330" y1="${yy}" x2="1280" y2="${yy}" stroke="#e8a63a" stroke-width="4"/>`;
    s += `<rect x="1330" y="${y0 - 70}" width="150" height="70" fill="#c9a574"/><polygon points="1310,${y0} 1405,${y0 - 120} 1500,${y0}" fill="#d9bd8d"/>`;
    s += `<polygon points="1480,200 1350,${y0 - 6} 1610,${y0 - 6}" fill="#ffe6bf" opacity="0.06"/>`;
  } else {
    s += `<rect x="340" y="540" width="800" height="26" fill="#161f27"/>`;
    s += `<rect x="560" y="380" width="680" height="160" fill="#d7dee4" opacity="0.94"/><rect x="540" y="356" width="720" height="26" fill="#161f27"/>`;
    s += `<rect x="600" y="410" width="420" height="104" fill="#ffd9a0" opacity="0.9"/>`;
    for (let i = 1; i < 5; i++) s += `<rect x="${600 + i * 84}" y="410" width="4" height="104" fill="#3a2a1d"/>`;
    s += `<rect x="1050" y="400" width="160" height="120" fill="#7a5233"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="${1052 + i * 13}" y="400" width="3" height="120" fill="#3a2515" opacity="0.7"/>`;
    s += `<rect x="410" y="620" width="300" height="140" fill="#ffc27a" opacity="0.88"/><rect x="408" y="618" width="304" height="6" fill="#161f27"/>`;
    for (let i = 1; i < 3; i++) s += `<rect x="${410 + i * 100}" y="620" width="4" height="140" fill="#3a2a1d"/>`;
    s += `<rect x="760" y="640" width="250" height="${y0 - 640}" fill="#3a444d"/>`;
    for (let yy = 650; yy < y0; yy += 22) s += `<rect x="764" y="${yy}" width="242" height="4" fill="#0f161c"/>`;
    s += `<rect x="1030" y="620" width="80" height="${y0 - 620}" fill="#7a5233"/>`;
    s += `<rect x="1060" y="700" width="40" height="8" fill="#ffe2a8"/>`;
    s += palmeira(1300, y0 + 4, 1.1) + palmeira(260, y0 + 6, 0.9);
    s += carro(1180, y0 + 54);
    for (let i = 0; i < 8; i++) s += `<circle cx="${340 + i * 120}" cy="${y0 + 28}" r="4" fill="#ffe2a8" opacity="0.9"/><circle cx="${340 + i * 120}" cy="${y0 + 28}" r="18" fill="#ffe2a8" opacity="0.12"/>`;
  }
  s += `<rect x="0" y="${y0}" width="${W}" height="${H - y0}" fill="url(#${id}-chao)"/><rect x="0" y="${y0}" width="${W}" height="3" fill="#6aaacb" opacity="0.3"/>`;
  return base(id, s, { ceu: ["#06101a", "#143452", "#2f6f93"] });
}
cenas["casa-moderna"] = () => casa("cm", rng(41));
cenas["casa-obra"] = () => casa("co", rng(43), { obra: true });

cenas["condominio"] = () => {
  const rand = rng(53);
  const id = "cd";
  const y0 = 800;
  let s = estrelas(rand, 50) + cidadeAoFundo(rand, y0 - 50, "#0a1c2c", 180);
  const blocos = [
    [180, 300, 360],
    [610, 380, 470],
    [1090, 330, 400],
  ];
  for (const [x, y, w] of blocos) {
    const h = y0 - y;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1b2d3c"/>`;
    for (let yy = y + 14; yy < y0 - 24; yy += 44) {
      s += `<rect x="${x - 8}" y="${yy + 28}" width="${w + 16}" height="8" fill="#2c4256"/>`;
      for (let xx = x + 14; xx < x + w - 30; xx += 54) {
        s += `<rect x="${xx}" y="${yy}" width="38" height="28" fill="${rand() < 0.5 ? janelaQuente[(rand() * 4) | 0] : "#6aaacb"}" opacity="${rand() < 0.5 ? 0.85 : 0.22}"/>`;
      }
    }
  }
  s += chao(id, y0, "");
  s += `<ellipse cx="800" cy="${y0 + 90}" rx="360" ry="46" fill="#29c0d6" opacity="0.28"/><ellipse cx="800" cy="${y0 + 90}" rx="300" ry="32" fill="#7be0f0" opacity="0.2"/>`;
  s += arvore(90, y0 + 10, 1.2) + arvore(570, y0 + 6, 0.9) + arvore(1060, y0 + 6, 0.9) + arvore(1500, y0 + 12, 1.3);
  for (let i = 0; i < 12; i++) s += `<circle cx="${150 + i * 120}" cy="${y0 + 28}" r="4" fill="#ffe2a8"/><circle cx="${150 + i * 120}" cy="${y0 + 28}" r="16" fill="#ffe2a8" opacity="0.1"/>`;
  return base(id, s);
};

cenas["comercial"] = () => {
  const rand = rng(67);
  const id = "cc";
  const y0 = 820;
  let s = estrelas(rand, 60) + cidadeAoFundo(rand, y0 - 30, "#0a1c2c", 260);
  s += `<polygon points="560,${y0} 560,260 700,90 1040,90 1040,${y0}" fill="url(#${id}-vidro)"/>`;
  for (let yy = 110; yy < y0 - 20; yy += 30) {
    for (let xx = 570; xx < 1030; xx += 28) {
      if (rand() < 0.5) s += `<rect x="${xx}" y="${yy}" width="20" height="18" fill="${janelaQuente[(rand() * 4) | 0]}" opacity="${r(0.5 + rand() * 0.5)}"/>`;
    }
  }
  for (let i = 0; i < 7; i++) s += `<polygon points="${580 + i * 70},${y0} ${620 + i * 70},${y0} ${900 + i * 70},90 ${860 + i * 70},90" fill="#bfe3ff" opacity="0.05"/>`;
  s += `<rect x="1040" y="360" width="260" height="${y0 - 360}" fill="#10303f"/><rect x="300" y="480" width="260" height="${y0 - 480}" fill="#10303f"/>`;
  s += chao(id, y0, reflexos(rand, y0, 26));
  return base(id, s);
};

cenas["projeto"] = () => {
  const id = "pj";
  let s = `<rect width="${W}" height="${H}" fill="#0c3a63"/>`;
  s += `<g stroke="#8fc7ea" stroke-opacity="0.18">`;
  for (let x = 0; x <= W; x += 40) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 0; y <= H; y += 40) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  s += `</g><g stroke="#cfe7f7" stroke-width="3" fill="none">`;
  s += `<rect x="360" y="240" width="880" height="520"/><line x1="360" y1="460" x2="720" y2="460"/><line x1="720" y1="240" x2="720" y2="760"/><line x1="720" y1="560" x2="1240" y2="560"/><line x1="980" y1="560" x2="980" y2="760"/><line x1="540" y1="460" x2="540" y2="760"/>`;
  s += `<path d="M720 380 a60 60 0 0 1 60 60"/><path d="M540 460 a50 50 0 0 0 50 50"/><path d="M980 560 a50 50 0 0 1 50 50"/>`;
  s += `<rect x="420" y="236" width="90" height="8" fill="#0c3a63"/><rect x="860" y="236" width="140" height="8" fill="#0c3a63"/><rect x="1236" y="360" width="8" height="120" fill="#0c3a63"/>`;
  s += `<line x1="360" y1="190" x2="1240" y2="190" stroke-width="2"/><line x1="360" y1="180" x2="360" y2="200"/><line x1="1240" y1="180" x2="1240" y2="200"/><line x1="1300" y1="240" x2="1300" y2="760" stroke-width="2"/><line x1="1290" y1="240" x2="1310" y2="240"/><line x1="1290" y1="760" x2="1310" y2="760"/>`;
  s += `<circle cx="1380" cy="180" r="46"/><line x1="1380" y1="120" x2="1380" y2="240"/><line x1="1320" y1="180" x2="1440" y2="180"/>`;
  s += `</g><g fill="#cfe7f7" font-family="Arial,sans-serif" font-size="22"><text x="760" y="180" text-anchor="middle">12,00 m</text><text x="470" y="360">SUÍTE</text><text x="440" y="640">SALA</text><text x="1000" y="440">COZINHA</text><text x="780" y="680">GARAGEM</text></g>`;
  s += `<rect x="1100" y="840" width="440" height="110" fill="none" stroke="#cfe7f7" stroke-width="2"/><text x="1120" y="885" fill="#cfe7f7" font-family="Arial,sans-serif" font-size="26">F7 CONSTRUTORA</text><text x="1120" y="925" fill="#8fc7ea" font-family="Arial,sans-serif" font-size="20">PROJETO · PLANTA BAIXA</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">${s}<rect width="${W}" height="${H}" fill="url(#${id}-v)" opacity="0"/></svg>`;
};

for (const [nome, gerar] of Object.entries(cenas)) {
  const svg = gerar();
  fs.writeFileSync(path.join(SAIDA, `${nome}.svg`), svg);
  console.log(nome, Math.round(svg.length / 1024) + " KB");
}
