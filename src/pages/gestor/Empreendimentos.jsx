import { useCallback, useEffect, useState } from "react";
import { api, enviarArquivo } from "../../lib/api.js";
import { STATUS_EMPREENDIMENTO } from "../../lib/formato.js";
import { reduzirImagem } from "../../lib/imagem.js";
import { useAviso } from "../../components/Toast.jsx";
import Modal from "../../components/Modal.jsx";
import Carregando from "../../components/Carregando.jsx";
import Skyline from "../../components/Skyline.jsx";
import BotaoConfirmar from "../../components/BotaoConfirmar.jsx";

function FormEmpreendimento({ item, aoSalvar }) {
  const avisar = useAviso();
  const [enviando, setEnviando] = useState(false);
  const [capa, setCapa] = useState(item?.capa ?? null);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dados = {
      ...Object.fromEntries(form),
      destaque: form.get("destaque") === "on",
      publicado: form.get("publicado") === "on",
    };
    setEnviando(true);
    setErro("");
    try {
      if (item) await api(`/api/gestor/empreendimentos/${item.id}`, { metodo: "PUT", dados });
      else await api("/api/gestor/empreendimentos", { metodo: "POST", dados });
      aoSalvar(Boolean(item));
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  async function trocarCapa(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      const resposta = await enviarArquivo(`/api/gestor/empreendimentos/${item.id}/capa`, await reduzirImagem(arquivo, 2400));
      setCapa(resposta.capa);
      avisar("Capa atualizada.");
    } catch (falha) {
      avisar(falha.message, "erro");
    }
    e.target.value = "";
  }

  return (
    <form onSubmit={enviar}>
      <div className="campos-linha">
        <label className="campo">
          <span>Nome</span>
          <input name="nome" defaultValue={item?.nome} required maxLength={120} />
        </label>
        <label className="campo">
          <span>Bairro / cidade</span>
          <input name="local" defaultValue={item?.local ?? ""} maxLength={120} placeholder="Bairro, cidade" />
        </label>
      </div>
      <div className="campos-linha">
        <label className="campo">
          <span>Situação</span>
          <select name="status" defaultValue={item?.status ?? "lancamento"}>
            {Object.entries(STATUS_EMPREENDIMENTO).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Ordem na lista</span>
          <input name="ordem" type="number" min={0} max={999} defaultValue={item?.ordem ?? 0} />
        </label>
      </div>
      <label className="campo">
        <span>Resumo (aparece no cartão)</span>
        <input name="resumo" defaultValue={item?.resumo ?? ""} maxLength={280} />
      </label>
      <label className="campo">
        <span>Descrição completa</span>
        <textarea name="descricao" rows={5} defaultValue={item?.descricao ?? ""} maxLength={4000} />
      </label>
      <div className="campos-linha campos-3">
        <label className="campo">
          <span>Unidades</span>
          <input name="unidades" defaultValue={item?.unidades ?? ""} maxLength={80} placeholder="37 apartamentos" />
        </label>
        <label className="campo">
          <span>Entrega (prevista ou realizada)</span>
          <input name="entrega" defaultValue={item?.entrega ?? ""} maxLength={60} placeholder="Abril de 2027" />
        </label>
        <label className="campo">
          <span>Metragem</span>
          <input name="area" defaultValue={item?.area ?? ""} maxLength={60} placeholder="35 m² a 53 m²" />
        </label>
      </div>
      <label className="campo">
        <span>Andamento da obra em % (só para obras em andamento)</span>
        <input name="percentual" type="number" min={0} max={100} defaultValue={item?.percentual ?? ""} placeholder="Ex.: 35" />
      </label>
      <label className="campo">
        <span>Endereço</span>
        <input name="endereco" defaultValue={item?.endereco ?? ""} maxLength={160} placeholder="Rua, número, bairro, cidade" />
      </label>
      <div className="checks">
        <label>
          <input type="checkbox" name="publicado" defaultChecked={item ? item.publicado : true} /> Mostrar no site
        </label>
        <label>
          <input type="checkbox" name="destaque" defaultChecked={item?.destaque} /> Destaque (aparece primeiro na lista)
        </label>
      </div>

      {item && (
        <div className="capa-editor">
          <div className="capa-previa">{capa ? <img src={capa} alt="" /> : <Skyline semente={item.slug} />}</div>
          <div>
            <strong>Imagem de capa</strong>
            <p className="form-nota">Sem capa, o site mostra uma ilustração no estilo do logo.</p>
            <label className="botao botao-contorno botao-pequeno">
              {capa ? "Trocar capa" : "Enviar capa"}
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={trocarCapa} />
            </label>
          </div>
        </div>
      )}
      {!item && <p className="form-nota">Depois de criar, abra o empreendimento para enviar a imagem de capa.</p>}

      {erro && (
        <p className="form-erro" role="alert">
          {erro}
        </p>
      )}
      <div className="modal-acoes">
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? "Salvando…" : item ? "Salvar" : "Criar empreendimento"}
        </button>
      </div>
    </form>
  );
}

// Barra de andamento da obra com ajuste na hora (salva ao soltar o controle).
function Andamento({ item, aoSalvar }) {
  const avisar = useAviso();
  const [valor, setValor] = useState(item.percentual ?? 0);
  useEffect(() => setValor(item.percentual ?? 0), [item.percentual]);

  if (item.status !== "em_obras") {
    return <div className="andamento andamento-fim">{item.status === "entregue" ? "Obra concluída" : ""}</div>;
  }

  async function salvar(novo) {
    try {
      await api(`/api/gestor/empreendimentos/${item.id}/andamento`, { metodo: "PUT", dados: { percentual: novo } });
      aoSalvar(novo);
      avisar(`${item.nome}: ${novo}% concluído. O site já mostra.`);
    } catch (falha) {
      avisar(falha.message, "erro");
    }
  }

  return (
    <div className="andamento">
      <div className="andamento-topo">
        <span>Andamento da obra</span>
        <strong>{item.percentual == null ? "não informado" : `${valor}%`}</strong>
      </div>
      <div className="barra">
        <i style={{ width: `${item.percentual == null ? 0 : valor}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={valor}
        aria-label={`Andamento de ${item.nome}`}
        onChange={(ev) => setValor(Number(ev.target.value))}
        onMouseUp={() => salvar(valor)}
        onTouchEnd={() => salvar(valor)}
        onKeyUp={(ev) => ["ArrowLeft", "ArrowRight", "Home", "End"].includes(ev.key) && salvar(valor)}
      />
    </div>
  );
}

export default function GestorEmpreendimentos() {
  const avisar = useAviso();
  const [lista, setLista] = useState(null);
  const [modal, setModal] = useState(null);

  const carregar = useCallback(
    () =>
      api("/api/gestor/empreendimentos")
        .then(setLista)
        .catch((falha) => avisar(falha.message, "erro")),
    [avisar]
  );

  useEffect(() => {
    document.title = "Empreendimentos — Painel F7";
    carregar();
  }, [carregar]);

  async function excluir(item) {
    try {
      await api(`/api/gestor/empreendimentos/${item.id}`, { metodo: "DELETE" });
      avisar("Empreendimento excluído.");
      carregar();
    } catch (falha) {
      avisar(falha.message, "erro");
    }
  }

  return (
    <div className="pagina-gestor">
      <div className="pagina-gestor-topo">
        <div>
          <h1>Empreendimentos</h1>
          <p>Obras em andamento e concluídas que aparecem no site. A situação define em qual lista a obra aparece.</p>
        </div>
        <button type="button" className="botao botao-primario botao-pequeno" onClick={() => setModal({})}>
          + Novo empreendimento
        </button>
      </div>

      {!lista ? (
        <Carregando />
      ) : !lista.length ? (
        <p className="vazio">Nenhum empreendimento cadastrado.</p>
      ) : (
        <div className="lista-emp">
          {lista.map((e) => (
            <div key={e.id} className={`linha-emp${e.publicado ? "" : " inativa"}`}>
              <div className="linha-emp-capa">{e.capa ? <img src={e.capa} alt="" /> : <Skyline semente={e.slug} />}</div>
              <div className="linha-emp-texto">
                <strong>{e.nome}</strong>
                <span>{e.local || "Sem localização"}</span>
              </div>
              <Andamento item={e} aoSalvar={(valor) => setLista((l) => l.map((x) => (x.id === e.id ? { ...x, percentual: valor } : x)))} />
              <div className="linha-emp-etiquetas">
                <span className={`etiqueta etiqueta-${e.status}`}>{STATUS_EMPREENDIMENTO[e.status]}</span>
                {!e.publicado && <span className="etiqueta etiqueta-pausada">Oculto</span>}
                {e.destaque && <span className="etiqueta">Destaque</span>}
              </div>
              <div className="tabela-acoes">
                {e.publicado && (
                  <a href={`/empreendimentos/${e.slug}`} target="_blank" rel="noreferrer" className="botao botao-fantasma botao-pequeno">
                    Ver no site
                  </a>
                )}
                <button type="button" className="botao botao-fantasma botao-pequeno" onClick={() => setModal({ item: e })}>
                  Editar
                </button>
                <BotaoConfirmar className="botao botao-fantasma botao-pequeno" confirmar="Excluir?" aoConfirmar={() => excluir(e)}>
                  Excluir
                </BotaoConfirmar>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          titulo={modal.item ? `Editar ${modal.item.nome}` : "Novo empreendimento"}
          aoFechar={() => {
            setModal(null);
            carregar();
          }}
          largura={680}
        >
          <FormEmpreendimento
            item={modal.item}
            aoSalvar={(editando) => {
              avisar(editando ? "Empreendimento salvo." : "Empreendimento criado.");
              setModal(null);
              carregar();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
