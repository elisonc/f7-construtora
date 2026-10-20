import { useEffect, useRef } from "react";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";

export default function Lightbox({ fotos, indice, aoFechar, aoMudar }) {
  const ref = useRef(null);
  const foto = fotos[indice];

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === "Escape") aoFechar();
      if (e.key === "ArrowRight") aoMudar(1);
      if (e.key === "ArrowLeft") aoMudar(-1);
    };
    window.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    ref.current?.querySelector(".lightbox-fechar")?.focus();
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [aoFechar, aoMudar]);

  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap.from(".lightbox-figura", { scale: 0.95, autoAlpha: 0, duration: 0.45 });
    },
    { scope: ref, dependencies: [indice], revertOnUpdate: true }
  );

  if (!foto) return null;
  const parar = (e) => e.stopPropagation();

  return (
    <div ref={ref} className="lightbox" role="dialog" aria-modal="true" aria-label="Foto da obra" onClick={aoFechar}>
      <button type="button" className="lightbox-fechar" onClick={aoFechar} aria-label="Fechar">
        ×
      </button>
      {fotos.length > 1 && (
        <button
          type="button"
          className="lightbox-seta esquerda"
          aria-label="Foto anterior"
          onClick={(e) => {
            parar(e);
            aoMudar(-1);
          }}
        >
          ‹
        </button>
      )}
      <figure className="lightbox-figura" onClick={parar}>
        <img src={foto.url} alt={foto.legenda || "Foto da obra"} />
        <figcaption>
          {foto.legenda || "Foto da obra"} · {indice + 1} de {fotos.length}
        </figcaption>
      </figure>
      {fotos.length > 1 && (
        <button
          type="button"
          className="lightbox-seta direita"
          aria-label="Próxima foto"
          onClick={(e) => {
            parar(e);
            aoMudar(1);
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}
