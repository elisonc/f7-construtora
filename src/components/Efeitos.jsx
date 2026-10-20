// Efeitos pequenos no estilo React Bits, feitos com GSAP para não somar dependências.
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, reduzirMovimento, ponteiroFino } from "../lib/gsap.js";

// Cartão com luz que segue o ponteiro (como o SpotlightCard do React Bits).
export function CartaoSpotlight({ as: Tag = "div", className = "", children, ...resto }) {
  const mover = (e) => {
    const caixa = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - caixa.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - caixa.top}px`);
  };
  return (
    <Tag className={`spotlight ${className}`} onPointerMove={mover} {...resto}>
      {children}
    </Tag>
  );
}

// Botão que é "puxado" pelo cursor (como o Magnet do React Bits). Só em mouse.
export function Magnetico({ children, forca = 0.3 }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (!ponteiroFino() || reduzirMovimento()) return;
      const el = ref.current;
      const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const mover = (e) => {
        const caixa = el.getBoundingClientRect();
        x((e.clientX - caixa.left - caixa.width / 2) * forca);
        y((e.clientY - caixa.top - caixa.height / 2) * forca);
      };
      const soltar = () => {
        x(0);
        y(0);
      };
      el.addEventListener("pointermove", mover);
      el.addEventListener("pointerleave", soltar);
      return () => {
        el.removeEventListener("pointermove", mover);
        el.removeEventListener("pointerleave", soltar);
      };
    },
    { scope: ref }
  );
  return (
    <span ref={ref} className="magnetico">
      {children}
    </span>
  );
}

const formatar = (n) => Math.round(n).toLocaleString("pt-BR");

// Número que conta até o valor (como o CountUp do React Bits).
export function Contador({ valor, prefixo = "", sufixo = "", aoRolar = true }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const el = ref.current;
      const fim = Number(valor) || 0;
      if (reduzirMovimento() || fim === 0) {
        el.textContent = formatar(fim);
        return;
      }
      const estado = { v: 0 };
      gsap.to(estado, {
        v: fim,
        duration: aoRolar ? 1.8 : 1.1,
        ease: "power2.out",
        scrollTrigger: aoRolar ? { trigger: el, start: "top 88%", once: true } : undefined,
        onUpdate: () => {
          el.textContent = formatar(estado.v);
        },
      });
    },
    { dependencies: [valor], revertOnUpdate: true }
  );
  return (
    <span className="contador">
      {prefixo}
      <span ref={ref}>0</span>
      {sufixo}
    </span>
  );
}

// Movimentos de texto e foto dentro de um bloco:
//  [data-titulo]   título: cada linha sobe de dentro de uma máscara
//  [data-escrever] título: letras aparecem uma a uma, como sendo escritas
//  [data-foto]     foto: abre da esquerda para a direita, com zoom e parallax
export function useMovimento(escopo, dependencias = []) {
  useGSAP(
    () => {
      const raiz = escopo.current;
      if (!raiz || reduzirMovimento()) return;
      const splits = [];

      gsap.utils.toArray("[data-titulo]", raiz).forEach((el) => {
        const gatilho = { trigger: el, start: "top 88%", once: true };
        splits.push(
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (s) =>
              gsap.fromTo(s.lines, { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out", scrollTrigger: gatilho }),
          })
        );
      });

      gsap.utils.toArray("[data-escrever]", raiz).forEach((el) => {
        const gatilho = { trigger: el, start: "top 88%", once: true };
        splits.push(
          SplitText.create(el, {
            type: "chars,words",
            autoSplit: true,
            onSplit: (s) =>
              gsap.fromTo(s.chars, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.05, stagger: 0.028, ease: "none", scrollTrigger: gatilho }),
          })
        );
      });

      gsap.utils.toArray("[data-foto]", raiz).forEach((el) => {
        const img = el.querySelector("img, svg");
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0 round 18px)" },
          { clipPath: "inset(0 0% 0 0 round 18px)", duration: 1.5, ease: "power4.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } }
        );
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.3, yPercent: -7 },
            { scale: 1.06, yPercent: 7, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } }
          );
        }
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: escopo, dependencies: dependencias, revertOnUpdate: true }
  );
}

// Revela os filhos marcados com [data-revelar] ao entrar na tela, em lote.
// Variações: data-revelar="esq" | "dir" | "zoom" | "blur" (padrão: sobe com fade).
export function useRevelar(escopo, dependencias = []) {
  useGSAP(
    () => {
      const alvos = gsap.utils.toArray("[data-revelar]", escopo.current);
      if (!alvos.length) return;
      if (reduzirMovimento()) {
        gsap.set(alvos, { autoAlpha: 1 });
        return;
      }
      const INICIO = {
        esq: { x: -70, y: 0 },
        dir: { x: 70, y: 0 },
        zoom: { scale: 0.9, y: 24 },
        blur: { filter: "blur(14px)", y: 24 },
      };
      alvos.forEach((el) => gsap.set(el, { autoAlpha: 0, y: 36, ...INICIO[el.dataset.revelar] }));
      ScrollTrigger.batch(alvos, {
        start: "top 88%",
        once: true,
        // clearProps devolve o transform ao CSS (efeitos de hover continuam funcionando).
        onEnter: (lote) =>
          gsap.to(lote, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.11,
            ease: "power3.out",
            overwrite: true,
            clearProps: "transform,opacity,visibility,filter",
          }),
      });
    },
    { scope: escopo, dependencies: dependencias, revertOnUpdate: true }
  );
}
