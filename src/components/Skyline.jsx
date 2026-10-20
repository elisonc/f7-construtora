// Imagem padrão de imóvel quando ainda não há foto enviada no painel.
// Fotos livres (Unsplash) em public/fotos; a planta (blueprint) é uma ilustração em public/cenas.
// A mesma semente sempre mostra a mesma imagem.
const FOTOS = new Set([
  "predio-pronto", "casa-moderna", "condominio", "comercial", "predio-obra", "casa-obra", "fundacao",
  "villa", "casa-branca", "obra-estrutura", "predio-varandas", "guindastes",
]);
const VITRINE = ["casa-branca", "condominio", "predio-pronto", "villa", "comercial", "casa-moderna"];

const FIXAS = {
  "hero-0-f7": "predio-varandas",
  "hero-1-f7": "casa-moderna",
  "hero-2-f7": "obra-estrutura",
  "historia-f7": "predio-obra",
  "dif-0-f7": "fundacao",
  "dif-1-f7": "villa",
  "dif-2-f7": "comercial",
  "residencial-aurora": "condominio",
  "casas-vila-serena": "villa",
  "edificio-atlantico": "predio-obra",
  "condominio-bosque-verde": "predio-varandas",
  "torre-prisma": "comercial",
};

export const urlCena = (nome, mini = false) => (FOTOS.has(nome) ? `/fotos/${nome}${mini ? "-m" : ""}.jpg` : `/cenas/${nome}.svg`);

export function cenaDe(semente = "f7") {
  if (FOTOS.has(semente) || semente === "projeto") return semente;
  if (FIXAS[semente]) return FIXAS[semente];
  let h = 2166136261;
  for (const c of String(semente)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return VITRINE[(h >>> 0) % VITRINE.length];
}

export default function Skyline({ semente = "f7", className = "", mini = false, eager = false }) {
  return (
    <img
      className={`skyline ${className}`}
      src={urlCena(cenaDe(semente), mini)}
      alt=""
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
    />
  );
}
