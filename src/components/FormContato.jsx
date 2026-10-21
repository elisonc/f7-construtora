import { useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";

export default function FormContato({ origem, interessePadrao = "", opcoes = [], titulo, compacto = false }) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro("");
    try {
      await api("/api/contato", {
        metodo: "POST",
        dados: { ...Object.fromEntries(form), origem },
      });
      setEnviado(true);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="form-sucesso" role="status">
        <svg viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" fill="none" />
          <path d="M15 27l7 7 15-16" fill="none" />
        </svg>
        <h3>Mensagem recebida!</h3>
        <p>Nossa equipe vai falar com você em breve.</p>
      </div>
    );
  }

  return (
    <form className={`form-contato${compacto ? " compacto" : ""}`} onSubmit={enviar} noValidate>
      {titulo && <h3>{titulo}</h3>}
      <label className="campo">
        <span>Nome</span>
        <input name="nome" required minLength={2} maxLength={120} autoComplete="name" />
      </label>
      <div className="campos-linha">
        <label className="campo">
          <span>E-mail</span>
          <input name="email" type="email" maxLength={160} autoComplete="email" />
        </label>
        <label className="campo">
          <span>Telefone / WhatsApp</span>
          <input name="telefone" type="tel" maxLength={30} autoComplete="tel" />
        </label>
      </div>
      {opcoes.length > 0 ? (
        <label className="campo">
          <span>Interesse</span>
          <select name="interesse" defaultValue={interessePadrao}>
            <option value="">Escolha uma opção</option>
            {opcoes.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="interesse" value={interessePadrao} />
      )}
      <label className="campo">
        <span>Mensagem</span>
        <textarea name="mensagem" rows={compacto ? 3 : 4} maxLength={2000} />
      </label>
      {/* Campo isca contra robôs: fica invisível para pessoas. */}
      <label className="isca" aria-hidden="true">
        Site
        <input name="site" tabIndex={-1} autoComplete="off" />
      </label>
      {erro && (
        <p className="form-erro" role="alert">
          {erro}
        </p>
      )}
      <button type="submit" className="botao botao-primario botao-bloco" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar mensagem"}
      </button>
      <p className="form-nota">
        Ao enviar, você concorda com a nossa <Link to="/privacidade">política de privacidade</Link>.
      </p>
    </form>
  );
}
