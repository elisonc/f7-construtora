import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "../../lib/api.js";
import { relativo } from "../../lib/formato.js";
import { useAviso } from "../../components/Toast.jsx";
import Modal from "../../components/Modal.jsx";
import Carregando from "../../components/Carregando.jsx";
import BotaoConfirmar from "../../components/BotaoConfirmar.jsx";

function FormCliente({ cliente, aoSalvar }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.currentTarget));
    setEnviando(true);
    setErro("");
    try {
      if (cliente) {
        await api(`/api/gestor/clientes/${cliente.id}`, { metodo: "PUT", dados });
        aoSalvar({ id: cliente.id });
      } else {
        aoSalvar({ ...(await api("/api/gestor/clientes", { metodo: "POST", dados })), nome: dados.nome, telefone: dados.telefone, email: dados.email, senhaDigitada: Boolean(dados.senha) });
      }
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      <label className="campo">
        <span>Nome completo</span>
        <input name="nome" defaultValue={cliente?.nome} required maxLength={120} />
      </label>
      <div className="campos-linha">
        <label className="campo">
          <span>E-mail (usado no login)</span>
          <input name="email" type="email" defaultValue={cliente?.email} required maxLength={160} />
        </label>
        <label className="campo">
          <span>Telefone / WhatsApp</span>
          <input name="telefone" type="tel" defaultValue={cliente?.telefone ?? ""} maxLength={30} />
        </label>
      </div>
      {!cliente && (
        <label className="campo">
          <span>Senha inicial (deixe em branco para gerar uma automática)</span>
          <input name="senha" type="text" minLength={8} maxLength={200} autoComplete="off" />
        </label>
      )}
      {erro && (
        <p className="form-erro" role="alert">
          {erro}
        </p>
      )}
      <div className="modal-acoes">
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? "Salvando…" : cliente ? "Salvar alterações" : "Cadastrar cliente"}
        </button>
      </div>
    </form>
  );
}

// Mostra a senha uma única vez, com atalhos para copiar ou mandar no WhatsApp.
function SenhaGerada({ cliente, senha, aoFechar }) {
  const avisar = useAviso();
  const acesso = `${window.location.origin}/entrar`;
  const mensagem = `Olá, ${cliente.nome.split(" ")[0]}! Seu acesso à área do cliente da F7 Engenharia Estratégica:\n${acesso}\nE-mail: ${cliente.email}\nSenha provisória: ${senha}\nNo primeiro acesso, troque a senha em "Minha senha".`;
  const telefone = (cliente.telefone || "").replace(/\D/g, "");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem);
      avisar("Mensagem copiada.");
    } catch {
      avisar("Não deu para copiar. Selecione o texto manualmente.", "erro");
    }
  }

  return (
    <div className="senha-gerada">
      {senha ? (
        <>
          <p>Envie estes dados ao cliente. A senha não aparece de novo.</p>
          <div className="senha-caixa">
            <span>Senha provisória</span>
            <code>{senha}</code>
          </div>
          <pre className="senha-mensagem">{mensagem}</pre>
          <div className="modal-acoes">
            <button type="button" className="botao botao-contorno" onClick={copiar}>
              Copiar mensagem
            </button>
            {telefone && (
              <a
                className="botao botao-contorno"
                href={`https://wa.me/${telefone.length <= 11 ? `55${telefone}` : telefone}?text=${encodeURIComponent(mensagem)}`}
                target="_blank"
                rel="noreferrer"
              >
                Enviar no WhatsApp
              </a>
            )}
          </div>
        </>
      ) : (
        <p>Cliente cadastrado com a senha que você digitou.</p>
      )}
      <div className="modal-acoes">
        {cliente.id && (
          <Link to={`/gestor/obras?novo=1&cliente=${cliente.id}`} className="botao botao-primario">
            Cadastrar obra deste cliente
          </Link>
        )}
        <button type="button" className="botao botao-fantasma" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function Clientes() {
  const avisar = useAviso();
  const [parametros, setParametros] = useSearchParams();
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState(null);
  const [modal, setModal] = useState(parametros.get("novo") ? { tipo: "novo" } : null);

  const carregar = useCallback(
    (termo) =>
      api(`/api/gestor/clientes?q=${encodeURIComponent(termo)}`)
        .then(setLista)
        .catch((falha) => avisar(falha.message, "erro")),
    [avisar]
  );

  useEffect(() => {
    document.title = "Clientes — Painel F7";
  }, []);

  useEffect(() => {
    const espera = setTimeout(() => carregar(busca), 250);
    return () => clearTimeout(espera);
  }, [busca, carregar]);

  const fechar = useCallback(() => {
    setModal(null);
    if (parametros.get("novo")) setParametros({}, { replace: true });
  }, [parametros, setParametros]);

  async function novaSenha(cliente) {
    try {
      const { senhaTemporaria } = await api(`/api/gestor/clientes/${cliente.id}/senha`, { metodo: "POST" });
      setModal({ tipo: "senha", cliente, senha: senhaTemporaria });
    } catch (falha) {
      avisar(falha.message, "erro");
    }
  }

  async function alternarAtivo(cliente) {
    try {
      await api(`/api/gestor/clientes/${cliente.id}`, { metodo: "PUT", dados: { ativo: !cliente.ativo } });
      avisar(cliente.ativo ? "Acesso do cliente desativado." : "Acesso do cliente reativado.");
      carregar(busca);
    } catch (falha) {
      avisar(falha.message, "erro");
    }
  }

  return (
    <div className="pagina-gestor">
      <div className="pagina-gestor-topo">
        <div>
          <h1>Clientes</h1>
          <p>Cadastre clientes para eles acessarem a área do cliente e acompanharem a obra.</p>
        </div>
        <button type="button" className="botao botao-primario botao-pequeno" onClick={() => setModal({ tipo: "novo" })}>
          + Novo cliente
        </button>
      </div>

      <div className="barra-ferramentas">
        <input
          type="search"
          placeholder="Buscar por nome, e-mail ou telefone"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar clientes"
        />
        {lista && <span className="contagem">{lista.length} cliente(s)</span>}
      </div>

      {!lista ? (
        <Carregando />
      ) : !lista.length ? (
        <p className="vazio">{busca ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}</p>
      ) : (
        <div className="tabela">
          <div className="tabela-cabeca" aria-hidden="true">
            <span>Cliente</span>
            <span>Telefone</span>
            <span>Obras</span>
            <span>Último acesso</span>
            <span>Status</span>
            <span />
          </div>
          {lista.map((c) => (
            <div key={c.id} className={`tabela-linha${c.ativo ? "" : " inativa"}`}>
              <div className="tabela-principal">
                <strong>{c.nome}</strong>
                <span>{c.email}</span>
              </div>
              <span data-rotulo="Telefone">{c.telefone || "—"}</span>
              <span data-rotulo="Obras">
                {c.obras ? (
                  <Link to="/gestor/obras" className="link-suave">
                    {c.obras}
                  </Link>
                ) : (
                  <Link to={`/gestor/obras?novo=1&cliente=${c.id}`} className="link-suave">
                    + obra
                  </Link>
                )}
              </span>
              <span data-rotulo="Último acesso">{relativo(c.ultimo_acesso)}</span>
              <span data-rotulo="Status">
                <span className={`etiqueta ${c.ativo ? "etiqueta-concluida" : "etiqueta-pausada"}`}>
                  {c.ativo ? (c.trocar_senha ? "Senha provisória" : "Ativo") : "Inativo"}
                </span>
              </span>
              <div className="tabela-acoes">
                <button type="button" className="botao botao-fantasma botao-pequeno" onClick={() => setModal({ tipo: "editar", cliente: c })}>
                  Editar
                </button>
                <BotaoConfirmar
                  className="botao botao-fantasma botao-pequeno"
                  confirmar="Gerar nova?"
                  aoConfirmar={() => novaSenha(c)}
                >
                  Nova senha
                </BotaoConfirmar>
                {c.ativo ? (
                  <BotaoConfirmar
                    className="botao botao-fantasma botao-pequeno"
                    confirmar="Desativar?"
                    aoConfirmar={() => alternarAtivo(c)}
                  >
                    Desativar
                  </BotaoConfirmar>
                ) : (
                  <button type="button" className="botao botao-fantasma botao-pequeno" onClick={() => alternarAtivo(c)}>
                    Reativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal?.tipo === "novo" && (
        <Modal titulo="Novo cliente" aoFechar={fechar}>
          <FormCliente
            aoSalvar={(resultado) => {
              carregar(busca);
              setModal({
                tipo: "senha",
                cliente: { id: resultado.id, nome: resultado.nome, email: resultado.email, telefone: resultado.telefone },
                senha: resultado.senhaTemporaria,
              });
            }}
          />
        </Modal>
      )}
      {modal?.tipo === "editar" && (
        <Modal titulo="Editar cliente" aoFechar={fechar}>
          <FormCliente
            cliente={modal.cliente}
            aoSalvar={() => {
              avisar("Cliente atualizado.");
              carregar(busca);
              fechar();
            }}
          />
        </Modal>
      )}
      {modal?.tipo === "senha" && (
        <Modal titulo="Acesso do cliente" aoFechar={fechar}>
          <SenhaGerada cliente={modal.cliente} senha={modal.senha} aoFechar={fechar} />
        </Modal>
      )}
    </div>
  );
}
