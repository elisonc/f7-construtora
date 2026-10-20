import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { MarcaF7 } from "./Logo.jsx";

// Abertura da primeira visita: os prédios do logo sobem, o arco desenha e a cortina abre.
export default function Intro({ aoTerminar }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap
        .timeline({ onComplete: aoTerminar })
        .from(".f7-barra", {
          scaleY: 0,
          transformOrigin: "50% 100%",
          stagger: { each: 0.045, from: "center" },
          duration: 0.75,
          ease: "power4.out",
        })
        .from(".f7-arco", { scaleX: 0, transformOrigin: "50% 50%", opacity: 0, duration: 0.6 }, "-=0.55")
        .from(".intro-texto", { opacity: 0, y: 16, letterSpacing: "0.5em", duration: 0.7 }, "-=0.35")
        .to(".intro-conteudo", { y: -30, opacity: 0, duration: 0.45, ease: "power2.in" }, "+=0.35")
        .to(ref.current, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "-=0.15");
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="intro-conteudo">
        <MarcaF7 className="intro-marca" />
        <div className="intro-texto">
          
          <small>Engenharia Estratégica</small>
        </div>
      </div>
    </div>
  );
}
