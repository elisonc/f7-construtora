import { useEffect, useRef, useState } from "react";
import { reduzirMovimento } from "../lib/gsap.js";

// Único fundo WebGL do site (Vanta Fog nas cores do logo).
// No celular ou com movimento reduzido fica só o gradiente em CSS, sem WebGL.
export default function HeroFundo() {
  const ref = useRef(null);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (reduzirMovimento() || window.innerWidth < 768) return;
    let efeito;
    let cancelado = false;
    Promise.all([import("three"), import("vanta/dist/vanta.fog.min")])
      .then(([THREE, modulo]) => {
        if (cancelado || !ref.current) return;
        // O Vanta é CommonJS: dependendo do empacotador vem como default ou default.default.
        let FOG = modulo.default ?? modulo;
        if (typeof FOG !== "function") FOG = FOG.default;
        efeito = FOG({
          el: ref.current,
          THREE,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          highlightColor: 0x4f8fb4,
          midtoneColor: 0x163f56,
          lowlightColor: 0x08131b,
          baseColor: 0x040608,
          blurFactor: 0.62,
          speed: 0.9,
          zoom: 0.75,
        });
        setAtivo(true);
      })
      .catch((erro) => console.warn("Fundo 3D indisponível, usando gradiente:", erro));
    return () => {
      cancelado = true;
      efeito?.destroy();
    };
  }, []);

  return <div ref={ref} className={`hero-fundo${ativo ? " ativo" : ""}`} aria-hidden="true" />;
}
