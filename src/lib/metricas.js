// Registra cada página vista do site (sem cookie). As áreas logadas do gestor ficam de fora.
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

export function useRastrearVisitas() {
  const { pathname } = useLocation();
  const ultimo = useRef(null);

  useEffect(() => {
    // O StrictMode roda o efeito duas vezes em dev; a mesma página seguida conta uma vez só.
    if (pathname.startsWith("/gestor") || ultimo.current === pathname) return;
    const origem = ultimo.current === null ? document.referrer : "";
    ultimo.current = pathname;
    fetch("/api/metricas/visita", {
      method: "POST",
      keepalive: true,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-F7": "1" },
      body: JSON.stringify({ caminho: pathname, origem }),
    }).catch(() => {});
  }, [pathname]);
}
