import { Link } from "react-router";
import Logo from "./Logo.jsx";
import { empresa, linkWhatsApp, digitos } from "../config.js";

export default function RodapeF7() {
  const emails = empresa.emails?.length ? empresa.emails : empresa.email ? [empresa.email] : [];
  const reduzido = typeof localStorage !== "undefined" && localStorage.getItem("f7-sem-animacao") === "1";

  return (
    <footer className="rodape">
      <div className="container rodape-grade">
        <div>
          <Logo branca />
{empresa.site && <span className="rodape-site">{empresa.site}</span>}
        </div>
        <div>
          <h3>Endereço</h3>
          {empresa.endereco ? <span>{empresa.endereco}</span> : <span>Em breve</span>}
        </div>
        <div>
          <h3>Contato</h3>
          {linkWhatsApp() && (
            <a href={linkWhatsApp()} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          )}
          {empresa.telefone && <a href={`tel:${digitos(empresa.telefone)}`}>{empresa.telefone}</a>}
          <Link to="/#contato">Enviar mensagem</Link>
        </div>
        <div>
          <h3>E-mails</h3>
          {emails.length ? (
            emails.map((e) => (
              <a key={e} href={`mailto:${e}`}>
                {e}
              </a>
            ))
          ) : (
            <Link to="/#contato">Fale pelo formulário</Link>
          )}
        </div>
      </div>
      <div className="container rodape-base">
        <span>
          © {new Date().getFullYear()} {empresa.nome}
          {empresa.cnpj ? ` — CNPJ ${empresa.cnpj}` : ""}
        </span>
        <span className="rodape-links">
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/entrar">Área do cliente</Link>
          <button
            type="button"
            className="rodape-animacao"
            onClick={() => {
              try {
                if (reduzido) localStorage.removeItem("f7-sem-animacao");
                else localStorage.setItem("f7-sem-animacao", "1");
              } catch {
                /* sem armazenamento */
              }
              window.location.reload();
            }}
          >
            {reduzido ? "Ativar animações" : "Reduzir animações"}
          </button>
        </span>
      </div>
    </footer>
  );
}
