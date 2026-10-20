import { useEffect, useState } from "react";

// Ações que não dá para desfazer pedem um segundo clique (sem janela do navegador).
export default function BotaoConfirmar({ children, confirmar = "Confirmar?", aoConfirmar, className = "" }) {
  const [pedindo, setPedindo] = useState(false);

  useEffect(() => {
    if (!pedindo) return;
    const espera = setTimeout(() => setPedindo(false), 4000);
    return () => clearTimeout(espera);
  }, [pedindo]);

  return (
    <button
      type="button"
      className={`${className}${pedindo ? " confirmando" : ""}`}
      onClick={() => {
        if (!pedindo) return setPedindo(true);
        setPedindo(false);
        aoConfirmar();
      }}
    >
      {pedindo ? confirmar : children}
    </button>
  );
}
