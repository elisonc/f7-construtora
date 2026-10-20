import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const ContextoImagens = createContext({});

// Imagens do site editáveis no painel do gestor (slides, seções). Vazio = ilustração padrão.
export function ImagensProvider({ children }) {
  const [imagens, setImagens] = useState({});
  useEffect(() => {
    api("/api/site/imagens")
      .then(setImagens)
      .catch(() => {});
  }, []);
  return <ContextoImagens.Provider value={imagens}>{children}</ContextoImagens.Provider>;
}

export const useImagens = () => useContext(ContextoImagens);
