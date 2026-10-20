// Datas do SQLite vêm como "AAAA-MM-DD HH:MM:SS" em UTC.
const paraData = (valor) => (valor ? new Date(`${valor.replace(" ", "T")}Z`) : null);

export function data(valor) {
  const d = paraData(valor);
  return d ? d.toLocaleDateString("pt-BR") : "—";
}

export function dataHora(valor) {
  const d = paraData(valor);
  return d ? d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
}

export function relativo(valor) {
  const d = paraData(valor);
  if (!d) return "Nunca";
  const minutos = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutos < 1) return "Agora";
  if (minutos < 60) return `Há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Há ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? "Ontem" : `Há ${dias} dias`;
}

export function mesAno(valor) {
  if (!valor) return "A definir";
  const [ano, mes] = valor.split("-").map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`;
}

export function diaCurto(iso) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

export function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

export const numero = (n) => Number(n || 0).toLocaleString("pt-BR");

export const STATUS_OBRA = {
  planejamento: "Planejamento",
  em_andamento: "Em andamento",
  pausada: "Pausada",
  concluida: "Concluída",
};

export const STATUS_EMPREENDIMENTO = {
  lancamento: "Lançamento",
  em_obras: "Em andamento",
  entregue: "Concluída",
};

export const STATUS_LEAD = {
  novo: "Novo",
  em_contato: "Em contato",
  convertido: "Convertido",
  descartado: "Descartado",
};

export const primeiroNome = (nome = "") => nome.split(" ")[0];
