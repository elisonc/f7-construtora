import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router";
import { AuthProvider, RotaProtegida } from "./lib/auth.jsx";
import { ContextoIntro } from "./lib/intro.js";
import { useRastrearVisitas } from "./lib/metricas.js";
import { reduzirMovimento } from "./lib/gsap.js";
import { ToastProvider } from "./components/Toast.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/RodapeF7.jsx";
import WhatsApp from "./components/WhatsApp.jsx";
import Intro from "./components/Intro.jsx";
import Carregando from "./components/Carregando.jsx";
import { ImagensProvider } from "./lib/imagens.jsx";
import Home from "./pages/Home.jsx";
import Empreendimento from "./pages/Empreendimento.jsx";
import Privacidade from "./pages/Privacidade.jsx";
import ObrasSite from "./pages/Obras.jsx";
import Diferenciais from "./pages/Diferenciais.jsx";
import NaoEncontrado from "./pages/NaoEncontrado.jsx";

// Áreas logadas carregam sob demanda: quem só visita o site não baixa esse código.
const Entrar = lazy(() => import("./pages/Entrar.jsx"));
const MinhaConta = lazy(() => import("./pages/MinhaConta.jsx"));
const LayoutGestor = lazy(() => import("./pages/gestor/Layout.jsx"));
const Dashboard = lazy(() => import("./pages/gestor/Dashboard.jsx"));
const Clientes = lazy(() => import("./pages/gestor/Clientes.jsx"));
const Obras = lazy(() => import("./pages/gestor/Obras.jsx"));
const ObraEditar = lazy(() => import("./pages/gestor/ObraEditar.jsx"));
const GestorEmpreendimentos = lazy(() => import("./pages/gestor/Empreendimentos.jsx"));
const Contatos = lazy(() => import("./pages/gestor/Contatos.jsx"));
const ImagensSite = lazy(() => import("./pages/gestor/ImagensSite.jsx"));

const CHAVE_INTRO = "f7-intro-vista";
function deveMostrarIntro(caminho) {
  if (caminho !== "/" || reduzirMovimento()) return false;
  try {
    return !sessionStorage.getItem(CHAVE_INTRO);
  } catch {
    return false;
  }
}

function LayoutSite() {
  const { pathname, hash } = useLocation();
  const [intro, setIntro] = useState(() => deveMostrarIntro(pathname));

  useEffect(() => {
    if (hash) {
      const alvo = document.getElementById(hash.slice(1));
      if (alvo) {
        requestAnimationFrame(() => alvo.scrollIntoView({ behavior: reduzirMovimento() ? "auto" : "smooth" }));
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  const terminarIntro = () => {
    setIntro(false);
    try {
      sessionStorage.setItem(CHAVE_INTRO, "1");
    } catch {
      /* navegação privada: a abertura volta na próxima visita */
    }
  };

  return (
    <ContextoIntro.Provider value={!intro}>
      {intro && <Intro aoTerminar={terminarIntro} />}
      <a href="#conteudo" className="pular">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Outlet />
      </main>
      <Footer />
      <WhatsApp />
    </ContextoIntro.Provider>
  );
}

function Rastreador() {
  useRastrearVisitas();
  return null;
}

// Depois que o site abriu, baixa em segundo plano o código das telas logadas (a troca de menu fica instantânea).
const aquecer = () =>
  Promise.all([
    import("./pages/Entrar.jsx"), import("./pages/MinhaConta.jsx"), import("./pages/gestor/Layout.jsx"),
    import("./pages/gestor/Dashboard.jsx"), import("./pages/gestor/Clientes.jsx"), import("./pages/gestor/Obras.jsx"),
    import("./pages/gestor/ObraEditar.jsx"), import("./pages/gestor/Empreendimentos.jsx"),
    import("./pages/gestor/Contatos.jsx"), import("./pages/gestor/ImagensSite.jsx"),
  ]).catch(() => {});
if (typeof window !== "undefined") {
  (window.requestIdleCallback || ((f) => setTimeout(f, 2500)))(() => setTimeout(aquecer, 1500));
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ImagensProvider>
          <Rastreador />
          <Suspense fallback={<Carregando tela />}>
            <Routes>
              <Route element={<LayoutSite />}>
                <Route index element={<Home />} />
                <Route path="empreendimentos/:slug" element={<Empreendimento />} />
                <Route path="privacidade" element={<Privacidade />} />
                <Route path="obras/:tipo" element={<ObrasSite />} />
                <Route path="diferenciais" element={<Diferenciais />} />
                <Route path="*" element={<NaoEncontrado />} />
              </Route>
              <Route path="entrar" element={<Entrar />} />
              <Route
                path="minha-conta"
                element={
                  <RotaProtegida papel="cliente">
                    <MinhaConta />
                  </RotaProtegida>
                }
              />
              <Route
                path="gestor"
                element={
                  <RotaProtegida papel="gestor">
                    <LayoutGestor />
                  </RotaProtegida>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="obras" element={<Obras />} />
                <Route path="obras/:id" element={<ObraEditar />} />
                <Route path="empreendimentos" element={<GestorEmpreendimentos />} />
                <Route path="contatos" element={<Contatos />} />
                <Route path="imagens" element={<ImagensSite />} />
              </Route>
            </Routes>
          </Suspense>
          </ImagensProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
