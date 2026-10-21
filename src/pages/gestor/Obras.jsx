import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "../../lib/api.js";
import { STATUS_OBRA, mesAno, relativo } from "../../lib/formato.js";
import { useAviso } from "../../components/Toast.jsx";
import Modal from "../../components/Modal.jsx";
import Carregando from "../../components/Carregando.jsx";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function parseMoeda(txt) {
  const num = Number(String(txt).replace(/[^\d]/g, ""));
  return isNaN(num) || num === 0 ? "" : String(num);
}

function formatarMoeda(txt) {
  const num = Number(String(txt).replace(/[^\d]/g, ""));
  return num > 0 ? BRL.format(num) : "";
}

function CampoMoeda({ nome, rotulo, valor }) {
  const [num, setNum] = useState(valor ? String(Math.round(valor)) : "");
  const display = num ? BRL.format(Number(num)) : "";
  return (
    <label className="campo">
      <span>{rotulo}</span>
      <input
        type="text"
        inputMode="numeric"
        name={nome}
        value={display}
        placeholder="R$ 0"
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          setNum(digits || "");
        }}
      />
    </label>
  );
}

export function CamposObra({ obra, clientes }) {
  return (
    <>
      <label className="campo">
        <span>Cliente</span>
        <select name="cliente_id" defaultValue={obra?.cliente_id ?? ""} required>
          <option value="" disabled>
            Escolha o cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({c.email})
            </option>
          ))}
        </select>
      </label>
      <label className="campo">
        <span>Nome da construção</span>
        <input name="nome" defaultValue={obra?.nome} required maxLength={120} placeholder="Ex.: Casa Lote 12 — Residencial X" />
      </label>
      <label className="campo">
        <span>Endereço</span>
        <input name="endereco" defaultValue={obra?.endereco ?? ""} maxLength={200} />
      </label>
      <div className="campos-linha">
        <label className="campo">
          <span>Previsão de entrega</span>
          <input name="previsao_entrega" type="month" defaultValue={obra?.previsao_entrega?.slice(0, 7) ?? ""} />
        </label>
        <label className="campo">
          <span>Situação</span>
          <select name="status" defaultValue={obra?.status ?? "em_andamento"}>
            {Object.entries(STATUS_OBRA).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="campos-linha">
        <CampoMoeda nome="orcado" rotulo="Valor total orçado (R$)" valor={obra?.orcado} />
        <CampoMoeda nome="gasto" rotulo="Valor gasto até agora (R$)" valor={obra?.gasto} />
      </div>
    </>
  );
}

function NovaObra({ clientes, clientePadrao, aoCriar }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.currentTarget));
    setEnviando(true);
    setErro("");
    try {
      const { id } = await api("/api/gestor/obras", { metodo: "POST", dados });
      aoCriar(id);
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  if (clientes === null) return <Carregando />;
  if (!clientes.length) {
    return (
      <div>
        <p>Cadastre o cliente antes de criar a construção.</p>
        <Link to="/gestor/clientes?novo=1" className="botao botao-primario">
          Cadastrar cliente
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar}>
      <CamposObra obra={clientePadrao ? { cliente_id: Number(clientePadrao) } : null} clientes={clientes} />
      <p className="form-nota">A construção começa com as etapas padrão (fundação, estrutura…). Você ajusta depois.</p>
      {erro && (
        <p className="form-erro" role="alert">
          {erro}
        </p>
      )}
      <div className="modal-acoes">
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? "Criando…" : "Criar construção"}
        </button>
      </div>
    </form>
  );
}

export default function Obras() {
  const avisar = useAviso();
  const navegar = useNavigate();
  const [parametros, setParametros] = useSearchParams();
  const [obras, setObras] = useState(null);
  const [clientes, setClientes] = useState(null);
  const [busca, setBusca] = useState("");
  const [novaAberta, setNovaAberta] = useState(Boolean(parametros.get("novo")));

  useEffect(() => {
    document.title = "Obras — Painel F7";
    api("/api/gestor/obras")
      .then(setObras)
      .catch((falha) => avisar(falha.message, "erro"));
    api("/api/gestor/clientes")
      .then((lista) => setClientes(lista.filter((c) => c.ativo)))
      .catch(() => setClientes([]));
  }, [avisar]);

  const fechar = useCallback(() => {
    setNovaAberta(false);
    if (parametros.get("novo")) setParametros({}, { replace: true });
  }, [parametros, setParametros]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (obras ?? []).filter(
      (o) => !termo || o.nome.toLowerCase().includes(termo) || o.cliente_nome.toLowerCase().includes(termo)
    );
  }, [obras, busca]);

  return (
    <div className="pagina-gestor">
      <div className="pagina-gestor-topo">
        <div>
          <h1>Obras</h1>
          <p>Atualize etapas, fotos e documentos. O cliente vê tudo na hora.</p>
        </div>
        <button type="button" className="botao botao-primario botao-pequeno" onClick={() => setNovaAberta(true)}>
          + Nova construção
        </button>
      </div>

      <div className="barra-ferramentas">
        <input
          type="search"
          placeholder="Buscar por construção ou cliente"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar obras"
        />
        {obras && <span className="contagem">{visiveis.length} obra(s)</span>}
      </div>

      {!obras ? (
        <Carregando />
      ) : !visiveis.length ? (
        <p className="vazio">{busca ? "Nenhuma obra encontrada." : "Nenhuma obra cadastrada ainda."}</p>
      ) : (
        <div className="grade-obras">
          {visiveis.map((o) => (
            <Link key={o.id} to={`/gestor/obras/${o.id}`} className="cartao-obra">
              <div className="cartao-obra-topo">
                <span className={`etiqueta etiqueta-${o.status}`}>{STATUS_OBRA[o.status]}</span>
                <span className="cartao-obra-percentual">{o.percentual}%</span>
              </div>
              <h3>{o.nome}</h3>
              <p>{o.cliente_nome}</p>
              <div className="barra">
                <i style={{ width: `${o.percentual}%` }} />
              </div>
              <dl>
                <div>
                  <dt>Entrega</dt>
                  <dd>{mesAno(o.previsao_entrega)}</dd>
                </div>
                <div>
                  <dt>Fotos</dt>
                  <dd>{o.total_fotos}</dd>
                </div>
                <div>
                  <dt>Docs</dt>
                  <dd>{o.total_documentos}</dd>
                </div>
              </dl>
              <span className="cartao-obra-rodape">Atualizada {relativo(o.atualizado_em).toLowerCase()}</span>
            </Link>
          ))}
        </div>
      )}

      {novaAberta && (
        <Modal titulo="Nova obra" aoFechar={fechar}>
          <NovaObra
            clientes={clientes}
            clientePadrao={parametros.get("cliente")}
            aoCriar={(id) => {
              avisar("Obra criada. Agora ajuste as etapas e envie fotos.");
              navegar(`/gestor/obras/${id}`);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
