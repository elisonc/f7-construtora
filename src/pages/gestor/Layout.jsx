import { Suspense, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../lib/auth.jsx";
import { gsap, useGSAP, reduzirMovimento } from "../../lib/gsap.js";
import Logo from "../../components/Logo.jsx";
import Carregando from "../../components/Carregando.jsx";
import Modal from "../../components/Modal.jsx";
import TemaBotao from "../../components/TemaBotao.jsx";
import TrocarSenha from "../../components/TrocarSenha.jsx";

const ICONES = {
  painel: "M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z",
  clientes: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.9M15.5 3.1a3.5 3.5 0 0 1 0 6.8",
  obras: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
  empreendimentos: "M4 21V5l8-2v18M12 21V9l8 3v9M8 9h0M8 13h0M8 17h0M16 15h0",
  contatos: "M4 5h16v12H8l-4 4zM8 9h8M8 13h5",
  imagens: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M8.5 9.5h0",
};

const MENU = [
  { para: "/gestor", texto: "Dashboard", icone: "painel", fim: true },
  { para: "/gestor/clientes", texto: "Clientes", icone: "clientes" },
  { para: "/gestor/obras", texto: "Construções", icone: "obras" },
  { para: "/gestor/empreendimentos", texto: "Obras do site", icone: "empreendimentos" },
  { para: "/gestor/contatos", texto: "Contatos", icone: "contatos" },
  { para: "/gestor/imagens", texto: "Imagens do site", icone: "imagens" },
];

export default function LayoutGestor() {
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const [senhaAberta, setSenhaAberta] = useState(false);
  const conteudo = useRef(null);

  // Transição suave a cada troca de página do painel.
  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap.from(conteudo.current, { y: 14, autoAlpha: 0, duration: 0.45, clearProps: "transform,opacity,visibility" });
    },
    { dependencies: [pathname], revertOnUpdate: true }
  );

  async function sairDoPainel() {
    await sair();
    navegar("/entrar", { replace: true });
  }

  return (
    <div className="gestor">
      <aside className="gestor-lateral">
        <Link to="/gestor" className="gestor-logo" aria-label="Início do painel">
          <Logo />
        </Link>
        <nav aria-label="Painel do gestor">
          {MENU.map((item) => (
            <NavLink key={item.para} to={item.para} end={item.fim}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={ICONES[item.icone]} />
              </svg>
              <span>{item.texto}</span>
            </NavLink>
          ))}
        </nav>
        <a href="/" target="_blank" rel="noreferrer" className="gestor-ver-site">
          Ver site ↗
        </a>
      </aside>

      <div className="gestor-principal">
        <header className="gestor-topo">
          <span className="gestor-topo-titulo">Painel do gestor</span>
          <div className="gestor-usuario">
            <TemaBotao />
            <span className="gestor-avatar" aria-hidden="true">
              {usuario.nome.slice(0, 1)}
            </span>
            <span className="gestor-nome">{usuario.nome}</span>
            <button type="button" className="botao botao-fantasma botao-pequeno" onClick={() => setSenhaAberta(true)}>
              Senha
            </button>
            <button type="button" className="botao botao-contorno botao-pequeno" onClick={sairDoPainel}>
              Sair
            </button>
          </div>
        </header>
        <main ref={conteudo} className="gestor-conteudo">
          <Suspense fallback={<Carregando />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {senhaAberta && (
        <Modal titulo="Alterar minha senha" aoFechar={() => setSenhaAberta(false)}>
          <TrocarSenha />
        </Modal>
      )}
    </div>
  );
}
