import { useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useAviso } from "./Toast.jsx";

export default function TrocarSenha() {
  const { atualizar } = useAuth();
  const avisar = useAviso();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = Object.fromEntries(new FormData(form));
    if (dados.nova !== dados.confirmar) {
      setErro("A confirmação não bate com a nova senha.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      await api("/api/conta/senha", { metodo: "POST", dados: { atual: dados.atual, nova: dados.nova } });
      form.reset();
      avisar("Senha alterada.");
      atualizar();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="form-senha" onSubmit={enviar}>
      <label className="campo">
        <span>Senha atual</span>
        <input name="atual" type="password" autoComplete="current-password" required />
      </label>
      <div className="campos-linha">
        <label className="campo">
          <span>Nova senha (mínimo 8 caracteres)</span>
          <input name="nova" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <label className="campo">
          <span>Confirmar nova senha</span>
          <input name="confirmar" type="password" autoComplete="new-password" minLength={8} required />
        </label>
      </div>
      {erro && (
        <p className="form-erro" role="alert">
          {erro}
        </p>
      )}
      <button type="submit" className="botao botao-contorno" disabled={enviando}>
        {enviando ? "Salvando…" : "Alterar senha"}
      </button>
    </form>
  );
}
