import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { api } from "./api.js";
import Carregando from "../components/Carregando.jsx";

const ContextoAuth = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const atualizar = useCallback(async () => {
    try {
      const { usuario } = await api("/api/auth/eu");
      setUsuario(usuario);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    atualizar();
  }, [atualizar]);

  const entrar = useCallback(async (email, senha) => {
    const { usuario } = await api("/api/auth/entrar", { metodo: "POST", dados: { email, senha } });
    setUsuario(usuario);
    return usuario;
  }, []);

  const sair = useCallback(async () => {
    await api("/api/auth/sair", { metodo: "POST" }).catch(() => {});
    setUsuario(null);
  }, []);

  return (
    <ContextoAuth.Provider value={{ usuario, carregando, entrar, sair, atualizar }}>{children}</ContextoAuth.Provider>
  );
}

export const useAuth = () => useContext(ContextoAuth);

export const inicioDoPapel = (papel) => (papel === "gestor" ? "/gestor" : "/minha-conta");

export function RotaProtegida({ papel, children }) {
  const { usuario, carregando } = useAuth();
  const local = useLocation();
  if (carregando) return <Carregando tela />;
  if (!usuario) return <Navigate to={`/entrar?volta=${encodeURIComponent(local.pathname)}`} replace />;
  if (usuario.papel !== papel) return <Navigate to={inicioDoPapel(usuario.papel)} replace />;
  return children;
}
