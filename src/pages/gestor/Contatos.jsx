import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import { STATUS_LEAD, dataHora } from "../../lib/formato.js";
import { useAviso } from "../../components/Toast.jsx";
import Carregando from "../../components/Carregando.jsx";

function exportarCsv(lista) {
  const colunas = ["criado_em", "nome", "email", "telefone", "interesse", "mensagem", "origem", "status"];
  const celula = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = [colunas.join(";"), ...lista.map((l) => colunas.map((c) => celula(l[c])).join(";"))];
  const blob = new Blob([`﻿${linhas.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `contatos-f7-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

const whatsDe = (telefone) => {
  const digitos = (telefone || "").replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
};

export default function Contatos() {
  const avisar = useAviso();
  const [lista, setLista] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const carregar = useCallback(
    () =>
      api("/api/gestor/leads")
        .then(setLista)
        .catch((falha) => avisar(falha.message, "erro")),
    [avisar]
  );

  useEffect(() => {
    document.title = "Contatos — Painel F7";
    carregar();
  }, [carregar]);

  const contagem = useMemo(() => {
    const c = { todos: lista?.length ?? 0 };
    for (const l of lista ?? []) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [lista]);

  const visiveis = (lista ?? []).filter((l) => filtro === "todos" || l.status === filtro);

  async function mudarStatus(lead, status) {
    setLista((atual) => atual.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await api(`/api/gestor/leads/${lead.id}`, { metodo: "PUT", dados: { status } });
    } catch (falha) {
      avisar(falha.message, "erro");
      carregar();
    }
  }

  return (
    <div className="pagina-gestor">
      <div className="pagina-gestor-topo">
        <div>
          <h1>Contatos</h1>
          <p>Mensagens do formulário do site e das páginas de empreendimento.</p>
        </div>
        {lista?.length > 0 && (
          <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => exportarCsv(visiveis)}>
            Exportar planilha (CSV)
          </button>
        )}
      </div>

      <div className="segmentado segmentado-largo" role="group" aria-label="Filtrar por situação">
        {["todos", ...Object.keys(STATUS_LEAD)].map((s) => (
          <button key={s} type="button" className={filtro === s ? "ativo" : ""} onClick={() => setFiltro(s)}>
            {s === "todos" ? "Todos" : STATUS_LEAD[s]} <small>{contagem[s] ?? 0}</small>
          </button>
        ))}
      </div>

      {!lista ? (
        <Carregando />
      ) : !visiveis.length ? (
        <p className="vazio">Nenhum contato aqui.</p>
      ) : (
        <div className="lista-leads">
          {visiveis.map((l) => {
            const whats = whatsDe(l.telefone);
            return (
              <article key={l.id} className={`lead lead-${l.status}`}>
                <div className="lead-topo">
                  <div>
                    <h3>{l.nome}</h3>
                    <span className="lead-data">
                      {dataHora(l.criado_em)} · {l.origem || "Site"}
                    </span>
                  </div>
                  <select
                    value={l.status}
                    onChange={(e) => mudarStatus(l, e.target.value)}
                    aria-label={`Situação do contato de ${l.nome}`}
                  >
                    {Object.entries(STATUS_LEAD).map(([valor, texto]) => (
                      <option key={valor} value={valor}>
                        {texto}
                      </option>
                    ))}
                  </select>
                </div>
                {l.interesse && (
                  <p className="lead-interesse">
                    Interesse: <strong>{l.interesse}</strong>
                  </p>
                )}
                {l.mensagem && <p className="lead-mensagem">{l.mensagem}</p>}
                <div className="lead-acoes">
                  {whats && (
                    <a className="botao botao-contorno botao-pequeno" href={whats} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  )}
                  {l.telefone && (
                    <a className="botao botao-fantasma botao-pequeno" href={`tel:${l.telefone.replace(/\D/g, "")}`}>
                      {l.telefone}
                    </a>
                  )}
                  {l.email && (
                    <a className="botao botao-fantasma botao-pequeno" href={`mailto:${l.email}`}>
                      {l.email}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
