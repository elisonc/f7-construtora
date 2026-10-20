import { createContext, useCallback, useContext, useState } from "react";

const ContextoAviso = createContext(() => {});

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const avisar = useCallback((texto, tipo = "ok") => {
    const id = crypto.randomUUID();
    setAvisos((lista) => [...lista, { id, texto, tipo }]);
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 4500);
  }, []);

  return (
    <ContextoAviso.Provider value={avisar}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`toast toast-${a.tipo}`}>
            {a.texto}
          </div>
        ))}
      </div>
    </ContextoAviso.Provider>
  );
}

export const useAviso = () => useContext(ContextoAviso);
