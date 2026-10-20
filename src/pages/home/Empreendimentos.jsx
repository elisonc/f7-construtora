import { useRef } from "react";
import { Link } from "react-router";
import Skyline from "../../components/Skyline.jsx";
import { useMovimento, useRevelar } from "../../components/Efeitos.jsx";
import { STATUS_EMPREENDIMENTO } from "../../lib/formato.js";
import { gsap, useGSAP, reduzirMovimento } from "../../lib/gsap.js";

export function CartaoEmpreendimento({ item }) {
  return (
    <Link to={`/empreendimentos/${item.slug}`} className="projeto">
      <div className="projeto-imagem">
        {item.capa ? <img src={item.capa} alt="" loading="eager" decoding="async" /> : <Skyline semente={item.slug} mini eager />}
        <span className={`etiqueta etiqueta-${item.status}`}>{STATUS_EMPREENDIMENTO[item.status]}</span>
      </div>
      <h3>{item.nome}</h3>
      {item.local && <span className="projeto-local">{item.local}</span>}
      <p>{item.resumo}</p>
      <span className="botao botao-primario botao-pequeno">
        Conheça <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default function Empreendimentos({ lista }) {
  const ref = useRef(null);
  const trilho = useRef(null);
  useRevelar(ref, [lista]);
  useMovimento(ref);

  function rolar(passo) {
    const el = trilho.current;
    const card = el.querySelector(".projeto");
    const largura = (card?.getBoundingClientRect().width ?? 320) + 24;
    const destino = el.scrollLeft + passo * largura;
    if (reduzirMovimento()) el.scrollLeft = destino;
    else gsap.to(el, { scrollLeft: destino, duration: 0.8, ease: "power3.inOut" });
  }

  // Cartões entram em sequência quando a lista chega.
  useGSAP(
    () => {
      if (!lista?.length || reduzirMovimento()) return;
      gsap.fromTo(
        ".projeto",
        { autoAlpha: 0, x: 80 },
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.12,
          duration: 1,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: trilho.current, start: "top 85%", once: true },
        }
      );
    },
    { scope: ref, dependencies: [lista?.length], revertOnUpdate: true }
  );

  return (
    <section id="empreendimentos" ref={ref} className="secao-escura projetos">
      <div className="container">
        <div className="projetos-topo">
          <div>
            <span className="sobrelinha" data-revelar>
              Empreendimentos
            </span>
            <h2 data-titulo>Nossos projetos mais recentes</h2>
            <p data-revelar="blur">Conheça os empreendimentos que refletem nossa qualidade, inovação e compromisso com cada detalhe.</p>
          </div>
          {lista?.length > 1 && (
            <div className="projetos-setas">
              <button type="button" onClick={() => rolar(-1)} aria-label="Projetos anteriores">
                ‹
              </button>
              <button type="button" onClick={() => rolar(1)} aria-label="Próximos projetos">
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
        ) : lista.length ? (
          <div ref={trilho} className="projetos-trilho" tabIndex={0} aria-label="Lista de empreendimentos">
            {lista.map((item) => (
              <CartaoEmpreendimento key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="vazio" data-revelar>
            Novos empreendimentos em breve. Fale com a gente para saber das próximas oportunidades.
          </p>
        )}
      </div>
    </section>
  );
}
