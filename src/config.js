// Dados institucionais da F7 Engenharia Estratégica. Campo vazio = o item some do site.
// Fonte: apresentação institucional (PDF). Endereço, telefone e e-mails do rodapé: confirmar.
export const empresa = {
  nome: "F7 Engenharia Estratégica",
  nomeCurto: "F7",
  slogan: "Construímos com quem constrói.",
  site: "www.f7engenhariaestrategica.com.br", // domínio ainda não registrado: aparece só como texto no rodapé
  whatsapp: "5541999720933", // só dígitos com 55 + DDD (confirmar o 9 inicial)
  telefone: "(41) 99972-0933",
  emails: [], // ex.: ["contato@f7engenhariaestrategica.com.br"]
  email: "",
  endereco: "Avenida República Argentina, 1350 — Água Verde, Curitiba/PR",
  horario: "",
  cnpj: "",
};

// Números da trajetória (PDF institucional).
export const numeros = [
  { valor: 20, sufixo: "+", rotulo: "anos de experiência" },
  { valor: 27, sufixo: "", rotulo: "empreendimentos entregues" },
  { valor: 938, sufixo: "", rotulo: "unidades entregues" },
  { valor: 64000, sufixo: " m²", rotulo: "construídos" },
];

export const regioes = ["Curitiba", "Campo Largo", "Pinhais", "Litoral Paranaense"];

export const temWhatsApp = Boolean(empresa.whatsapp);
export const linkWhatsApp = (mensagem = "Olá! Vim pelo site da F7 Engenharia Estratégica.") =>
  temWhatsApp ? `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensagem)}` : null;
export const digitos = (t) => t.replace(/\D/g, "");
