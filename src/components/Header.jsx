import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import Logo from "./Logo.jsx";
import { Magnetico } from "./Efeitos.jsx";
import TemaBotao from "./TemaBotao.jsx";
import { useAuth, inicioDoPapel } from "../lib/auth.jsx";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";
import { linkWhatsApp } from "../config.js";

// Menu: itens simples e menus suspensos (lista para baixo).
const MENU = [
  { texto: "Quem somos", para: "/#sobre" },
  {
    texto: "Obras",
    sub: [
      { texto: "Em andamento", para: "/obras/andamento" },
      { texto: "Concluídas", para: "/obras/concluidas" },
    ],
  },
  {
    texto: "Diferenciais",
    sub: [
      { texto: "Certificados (ISO 9001 e PBQP-H)", para: "/diferenciais#certificados" },
      { texto: "Atendimento personalizado", para: "/diferenciais#atendimento" },
      { texto: "Seguro de entrega e pós-obra", para: "/diferenciais#seguro" },
      { texto: "Equipe própria de obra", para: "/diferenciais#equipe" },
      { texto: "Onde atuamos", para: "/diferenciais#regioes" },
    ],
  },
  { texto: "Contato", para: "/#contato" },
];

function ItemSuspenso({ item }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => !ref.current?.contains(e.target) && setAberto(false);
    const esc = (e) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div
      ref={ref}
      className={`suspenso${aberto ? " aberto" : ""}`}
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
    >
      <button type="button" aria-expanded={aberto} aria-haspopup="true" onClick={() => setAberto((v) => !v)}>
        {item.texto}
        <svg viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1l5 5 5-5" />
        </svg>
      </button>
      <ul>
        {item.sub.map((s) => (
          <li key={s.para}>
            <Link to={s.para} onClick={() => setAberto(false)}>
              {s.texto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Header() {
  const { usuario } = useAuth();
  const local = useLocation();
  const [rolado, setRolado] = useState(false);
  const [escondido, setEscondido] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  // Fundo ao rolar; some ao descer e volta ao subir.
  useEffect(() => {
    let anterior = window.scrollY;
    const aoRolar = () => {
      const atual = window.scrollY;
      setRolado(atual > 30);
      setEscondido(atual > 400 && atual > anterior + 4);
      if (atual < anterior - 4) setEscondido(false);
      anterior = atual;
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => setMenuAberto(false), [local.pathname, local.hash]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  useGSAP(
    () => {
      if (!menuAberto || reduzirMovimento()) return;
      gsap.from(".menu-mobile a, .menu-mobile .botao", { y: 40, autoAlpha: 0, stagger: 0.06, duration: 0.6 });
    },
    { scope: menuRef, dependencies: [menuAberto], revertOnUpdate: true }
  );

  // Páginas sem foto/faixa escura no topo (privacidade, 404...) usam o cabeçalho com fundo sólido.
  const p = local.pathname;
  const temHero = p === "/" || p.startsWith("/obras/") || p === "/diferenciais" || p.startsWith("/empreendimentos/");
  const destinoArea = usuario ? inicioDoPapel(usuario.papel) : "/entrar";
  const textoArea = usuario ? (usuario.papel === "gestor" ? "Painel do gestor" : "Minha obra") : "Área do cliente";

  return (
    <header className={`topo${rolado || !temHero ? " rolado" : ""}${escondido && !menuAberto ? " escondido" : ""}`}>
      <div className="topo-interno">
        <Link to="/" className="topo-logo" aria-label="F7 Engenharia Estratégica, página inicial">
          <Logo />
        </Link>
        <nav className="topo-nav" aria-label="Principal">
          {MENU.map((item) =>
            item.sub ? (
              <ItemSuspenso key={item.texto} item={item} />
            ) : (
              <Link key={item.para} to={item.para}>
                {item.texto}
              </Link>
            )
          )}
        </nav>
        <div className="topo-acoes">
          <TemaBotao />
          <Magnetico>
            <Link to={destinoArea} className="botao botao-contorno botao-pequeno">
              {textoArea}
            </Link>
          </Magnetico>
          <button
            type="button"
            className={`hamburguer${menuAberto ? " aberto" : ""}`}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div ref={menuRef} className={`menu-mobile${menuAberto ? " aberto" : ""}`} hidden={!menuAberto}>
        {menuAberto && (
          <>
            {MENU.map((item) =>
              item.sub ? (
                <div key={item.texto} className="menu-mobile-grupo">
                  <h3>{item.texto}</h3>
                  {item.sub.map((s) => (
                    <Link key={s.para} to={s.para}>
                      {s.texto}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.para} to={item.para}>
                  {item.texto}
                </Link>
              )
            )}
            <Link to={destinoArea} className="botao botao-primario">
              {textoArea}
            </Link>
            {linkWhatsApp() && (
              <a href={linkWhatsApp()} target="_blank" rel="noreferrer" className="botao botao-contorno">
                Falar no WhatsApp
              </a>
            )}
          </>
        )}
      </div>
    </header>
  );
}
