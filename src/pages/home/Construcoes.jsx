import { useRef } from "react";
import { Link } from "react-router";
import { useMovimento, useRevelar } from "../../components/Efeitos.jsx";
import { CartaoObra } from "../Obras.jsx";
import { gsap, useGSAP, reduzirMovimento } from "../../lib/gsap.js";

// Vitrine da home: obras em andamento e as últimas entregas, em carrossel.
export default function Construcoes({ lista }) {
  const ref = useRef(null);
  const trilho = useRef(null);
  useRevelar(ref, [lista]);
  useMovimento(ref);

  const andamento = (lista ?? []).filter((o) => o.status === "em_obras");
  const concluidas = (lista ?? []).filter((o) => o.status === "entregue").slice(0, 6);
  const vitrine = [...andamento, ...concluidas];

  function rolar(passo) {
    const el = trilho.current;
    const largura = (el.querySelector(".projeto")?.getBoundingClientRect().width ?? 320) + 24;
    const destino = el.scrollLeft + passo * largura;
    if (reduzirMovimento()) el.scrollLeft = destino;
    else gsap.to(el, { scrollLeft: destino, duration: 0.8, ease: "power3.inOut" });
  }

  useGSAP(
    () => {
      if (!vitrine.length || reduzirMovimento()) return;
      gsap.fromTo(
        ".projeto",
        { autoAlpha: 0, x: 80 },
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.1,
          duration: 1,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: trilho.current, start: "top 85%", once: true },
        }
      );
    },
    { scope: ref, dependencies: [vitrine.length], revertOnUpdate: true }
  );

  return (
    <section id="construcoes" ref={ref} className="secao-escura projetos">
      <div className="container">
        <div className="projetos-topo">
          <div>
            <span className="sobrelinha" data-revelar>
              Obras
            </span>
            <h2 data-titulo>Obras em andamento e entregas recentes</h2>
            <p data-revelar="blur">
              Planejamento, execução e acompanhamento em cada etapa, da concepção à entrega das chaves.
            </p>
          </div>
          {vitrine.length > 1 && (
            <div className="projetos-setas">
              <button type="button" onClick={() => rolar(-1)} aria-label="Obras anteriores">
                ‹
              </button>
              <button type="button" onClick={() => rolar(1)} aria-label="Próximas obras">
                ›
              </button>
            </div>
          )}
        </div>

        {lista === null ? (
          <div className="projetos-trilho">
            {[1, 2, 3].map((i) => (
              <div key={i} className="projeto esqueleto" />
            ))}
          </div>
        ) : vitrine.length ? (
          <div ref={trilho} className="projetos-trilho" tabIndex={0} aria-label="Lista de obras">
            {vitrine.map((item) => (
              <CartaoObra key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="vazio" data-revelar>
            Em breve, novas obras por aqui.
          </p>
        )}

        <div className="projetos-links" data-revelar>
          <Link to="/obras/andamento" className="botao botao-primario">
            Ver obras em andamento
          </Link>
          <Link to="/obras/concluidas" className="botao botao-contorno">
            Ver obras concluídas
          </Link>
        </div>
      </div>
    </section>
  );
}
