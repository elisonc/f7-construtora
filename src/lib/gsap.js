// Registro único dos plugins do GSAP usados no projeto.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, useGSAP);
gsap.defaults({ ease: "power3.out", duration: 0.8 });

// As animações vêm ligadas. Quem prefere menos movimento usa "Reduzir animações" no rodapé
// (salvo neste navegador), que desliga tudo e deixa o conteúdo parado.
export const reduzirMovimento = () => {
  try {
    return localStorage.getItem("f7-sem-animacao") === "1";
  } catch {
    return false;
  }
};
export const ponteiroFino = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };
