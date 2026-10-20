import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, reduzirMovimento } from "../../lib/gsap.js";
import { useRevelar } from "../../components/Efeitos.jsx";

const ETAPAS = [
  { titulo: "Conversa e viabilidade", texto: "Entendemos o terreno, o objetivo e o orçamento antes de qualquer traço." },
  { titulo: "Projeto e aprovação", texto: "Arquitetura, engenharia e licenças (alvará, ART/RRT) com responsável técnico." },
  { titulo: "Obra com cronograma", texto: "Execução planejada por etapas, com controle de materiais e qualidade." },
  { titulo: "Acompanhamento online", texto: "Fotos, percentual por etapa e documentos atualizados na área do cliente." },
  { titulo: "Entrega e pós-obra", texto: "Vistoria com você, manual do proprietário e suporte depois das chaves." },
];

export default function Processo() {
  const ref = useRef(null);
  useRevelar(ref);

  useGSAP(
    () => {
      if (reduzirMovimento()) {
        gsap.set(".processo-progresso", { scaleY: 1 });
        return;
      }
      // A linha enche conforme a rolagem e cada etapa acende quando a linha chega nela.
      gsap.fromTo(
        ".processo-progresso",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".processo-lista", start: "top 65%", end: "bottom 65%", scrub: 0.6 },
        }
      );
      gsap.utils.toArray(".processo-etapa").forEach((etapa) => {
        ScrollTrigger.create({ trigger: etapa, start: "top 65%", toggleClass: "ativa" });
      });
    },
    { scope: ref }
  );

  return (
    <section id="processo" ref={ref} className="secao processo">
      <div className="container processo-grade">
        <div className="processo-cabeca">
          <span className="sobrelinha" data-revelar>
            Como construímos
          </span>
          <h2 data-revelar>Um caminho claro, do primeiro café à entrega das chaves.</h2>
          <p data-revelar>
            Cada fase tem responsável, prazo e registro. Você sabe o que está acontecendo e o que vem depois.
          </p>
        </div>
        <ol className="processo-lista">
          <span className="processo-trilho" aria-hidden="true">
            <span className="processo-progresso" />
          </span>
          {ETAPAS.map((e, i) => (
            <li key={e.titulo} className="processo-etapa" data-revelar>
              <span className="processo-numero">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{e.titulo}</h3>
                <p>{e.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
