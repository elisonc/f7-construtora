import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth, inicioDoPapel } from "../lib/auth.jsx";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";
import { linkWhatsApp } from "../config.js";
import Logo, { MarcaF7 } from "../components/Logo.jsx";
import TemaBotao from "../components/TemaBotao.jsx";

export default function Entrar() {
  const { usuario, carregando, entrar } = useAuth();
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    document.title = "Entrar — F7 Engenharia Estratégica";
  }, []);

  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap
        .timeline()
        .from(".entrar-visual .f7-barra", {
          scaleY: 0,
          transformOrigin: "50% 100%",
          stagger: { each: 0.04, from: "center" },
          duration: 1,
          ease: "power4.out",
        })
        .from(".entrar-visual .f7-arco", { scaleX: 0, opacity: 0, transformOrigin: "50% 50%" }, 0.3)
        .from(".entrar-visual p", { y: 20, autoAlpha: 0 }, 0.5)
        .from(".entrar-caixa > *", { y: 24, autoAlpha: 0, stagger: 0.06 }, 0.15);
    },
    { scope: ref }
  );

  // Só volta para a página pedida se ela for da área do próprio papel.
  const destino = (u) => {
    const volta = parametros.get("volta");
    const base = inicioDoPapel(u.papel);
    return volta && volta.startsWith(base) ? volta : base;
  };

  if (!carregando && usuario) return <Navigate to={destino(usuario)} replace />;

  async function enviar(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro("");
    try {
      const u = await entrar(String(form.get("email")), String(form.get("senha")));
      navegar(destino(u), { replace: true });
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  return (
    <div ref={ref} className="entrar">
      <div className="entrar-visual" aria-hidden="true">
        <MarcaF7 />
        <p>Acompanhe sua obra de onde estiver: etapas, fotos e documentos em um só lugar.</p>
      </div>

      <div className="entrar-lado">
        <TemaBotao className="entrar-tema" />
        <div className="entrar-caixa">
          <Link to="/" className="entrar-logo" aria-label="Voltar ao site da F7 Engenharia Estratégica">
            <Logo />
          </Link>
          <h1>Área do cliente</h1>
          <p>Entre com o e-mail e a senha que a F7 enviou para você.</p>

          <form onSubmit={enviar}>
            <label className="campo">
              <span>E-mail</span>
              <input name="email" type="email" autoComplete="username" required autoFocus />
            </label>
            <label className="campo">
              <span>Senha</span>
              <div className="campo-senha">
                <input
                  name="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setMostrarSenha((v) => !v)} aria-pressed={mostrarSenha}>
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>
            {erro && (
              <p className="form-erro" role="alert">
                {erro}
              </p>
            )}
            <button type="submit" className="botao botao-primario botao-bloco" disabled={enviando}>
              {enviando ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="entrar-ajuda">
            Esqueceu a senha?{" "}
            {linkWhatsApp() ? (
              <a href={linkWhatsApp("Olá! Preciso de uma nova senha para a área do cliente.")} target="_blank" rel="noreferrer">
                Fale com a F7
              </a>
            ) : (
              <Link to="/#contato">Fale com a F7</Link>
            )}{" "}
            e enviamos uma nova.
          </p>
          <Link to="/" className="voltar">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
