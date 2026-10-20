import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";

export default function Modal({ titulo, aoFechar, children, largura = 560 }) {
  const ref = useRef(null);
  const fechar = useRef(aoFechar);
  fechar.current = aoFechar;

  useEffect(() => {
    const tecla = (e) => e.key === "Escape" && fechar.current();
    window.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    ref.current?.querySelector("input, select, textarea, button:not(.modal-fechar)")?.focus();
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, []);

  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap.from(".modal", { y: 24, scale: 0.97, autoAlpha: 0, duration: 0.4 });
      gsap.from(ref.current, { autoAlpha: 0, duration: 0.25 });
    },
    { scope: ref }
  );

  return createPortal(
    <div ref={ref} className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} style={{ maxWidth: largura }}>
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button type="button" className="modal-fechar" onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
