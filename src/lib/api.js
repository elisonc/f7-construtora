// Chamadas à API. O cabeçalho X-F7 é exigido pelo servidor em toda escrita (proteção CSRF).
export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export async function api(caminho, { metodo = "GET", dados, arquivo, cabecalhos = {} } = {}) {
  const opcoes = { method: metodo, credentials: "same-origin", headers: { "X-F7": "1", ...cabecalhos } };
  if (arquivo) {
    opcoes.body = arquivo;
    opcoes.headers["Content-Type"] = arquivo.type || "application/octet-stream";
  } else if (dados !== undefined) {
    opcoes.body = JSON.stringify(dados);
    opcoes.headers["Content-Type"] = "application/json";
  }
  let resposta;
  try {
    resposta = await fetch(caminho, opcoes);
  } catch {
    throw new ErroApi(0, "Sem conexão com o servidor. Verifique sua internet.");
  }
  const corpo = resposta.status === 204 ? null : await resposta.json().catch(() => null);
  if (!resposta.ok) throw new ErroApi(resposta.status, corpo?.erro || "Algo deu errado. Tente de novo.");
  return corpo;
}

// Envio de arquivo com metadados em cabeçalhos (nome, legenda, categoria).
export function enviarArquivo(caminho, arquivo, metadados = {}) {
  const cabecalhos = {};
  for (const [chave, valor] of Object.entries(metadados)) {
    if (valor) cabecalhos[`X-${chave}`] = encodeURIComponent(valor);
  }
  return api(caminho, { metodo: "POST", arquivo, cabecalhos });
}
