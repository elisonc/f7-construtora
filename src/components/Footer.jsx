import { Link } from "react-router";
import Logo from "./Logo.jsx";
import { empresa, linkWhatsApp, digitos } from "../config.js";

export default function Footer() {
  return (
    <footer className="rodape">
      <div className="container rodape-grade">
        <div>
          <Logo onde="rodape" />
          <p className="rodape-slogan">{empresa.slogan}</p>
        </div>
        <div>
          <h3>Navegação</h3>
          <Link to="/#sobre">Sobre</Link>
          <Link to="/#empreendimentos">Empreendimentos</Link>
          <Link to="/#processo">Como construímos</Link>
          <Link to="/#contato">Contato</Link>
        </div>
        <div>
          <h3>Atendimento</h3>
          {linkWhatsApp() && (
            <a href={linkWhatsApp()} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          )}
          {empresa.telefone && <a href={`tel:${digitos(empresa.telefone)}`}>{empresa.telefone}</a>}
          {empresa.email && <a href={`mailto:${empresa.email}`}>{empresa.email}</a>}
          {empresa.horario && <span>{empresa.horario}</span>}
          <Link to="/#contato">Enviar mensagem</Link>
        </div>
        <div>
          <h3>Clientes</h3>
          <Link to="/entrar">Área do cliente</Link>
          <Link to="/privacidade">Privacidade</Link>
        </div>
      </div>
      <div className="container rodape-base">
        <span>
          © {new Date().getFullYear()} {empresa.nome}
          {empresa.cnpj ? ` — CNPJ ${empresa.cnpj}` : ""}
        </span>
        {empresa.endereco && <span>{empresa.endereco}</span>}
        <button
          type="button"
          className="rodape-animacao"
          onClick={() => {
            const ligado = localStorage.getItem("f7-sem-animacao") === "1";
            try {
              if (ligado) localStorage.removeItem("f7-sem-animacao");
              else localStorage.setItem("f7-sem-animacao", "1");
            } catch {
              /* sem armazenamento */
            }
            window.location.reload();
          }}
        >
          {typeof localStorage !== "undefined" && localStorage.getItem("f7-sem-animacao") === "1" ? "Ativar animações" : "Reduzir animações"}
        </button>
      </div>
    </footer>
  );
}
