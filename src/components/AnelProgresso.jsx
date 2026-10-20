import { useId, useRef } from "react";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";

export default function AnelProgresso({ valor = 0, tamanho = 190, espessura = 12, rotulo = "concluído", aoRolar = false }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arco = useRef(null);
  const texto = useRef(null);
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;

  useGSAP(
    () => {
      const fim = circunferencia * (1 - valor / 100);
      if (reduzirMovimento()) {
        gsap.set(arco.current, { strokeDashoffset: fim });
        texto.current.textContent = `${valor}%`;
        return;
      }
      const estado = { v: 0 };
      gsap
        .timeline({
          delay: 0.2,
          scrollTrigger: aoRolar ? { trigger: arco.current, start: "top 85%", once: true } : undefined,
        })
        .fromTo(
          arco.current,
          { strokeDashoffset: circunferencia },
          { strokeDashoffset: fim, duration: 1.6, ease: "power2.out" }
        )
        .to(
          estado,
          {
            v: valor,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              texto.current.textContent = `${Math.round(estado.v)}%`;
            },
          },
          0
        );
    },
    { dependencies: [valor, circunferencia], revertOnUpdate: true }
  );

  return (
    <div className="anel" style={{ width: tamanho, height: tamanho, "--t": `${tamanho}px` }}>
      <svg viewBox={`0 0 ${tamanho} ${tamanho}`} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#3f84ab" />
          </linearGradient>
        </defs>
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth={espessura}
        />
        <circle
          ref={arco}
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia}
          transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
        />
      </svg>
      <div className="anel-centro" role="img" aria-label={`${valor}% ${rotulo}`}>
        <strong ref={texto}>0%</strong>
        <span>{rotulo}</span>
      </div>
    </div>
  );
}
