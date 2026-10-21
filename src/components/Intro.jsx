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
        .from(".intro-marca", { opacity: 0, scale: 0.9, y: 20, duration: 0.8, ease: "power4.out" })
        .from(".intro-texto", { opacity: 0, y: 16, duration: 0.6 }, "-=0.3")
        .to(".intro-conteudo", { y: -30, opacity: 0, duration: 0.45, ease: "power2.in" }, "+=0.35")
        .to(ref.current, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "-=0.15");
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="intro-conteudo">
        <MarcaF7 className="intro-marca" />
      </div>
    </div>
  );
}
