import { useRef } from "react";
import Skyline from "../../components/Skyline.jsx";
import { useRevelar } from "../../components/Efeitos.jsx";
import { gsap, useGSAP, reduzirMovimento } from "../../lib/gsap.js";

const VALORES = [
  { titulo: "Transparência", texto: "Você vê o andamento real da obra, com fotos e documentos na área do cliente." },
  { titulo: "Qualidade técnica", texto: "Projetos com responsável técnico e execução conferida em cada etapa." },
  { titulo: "Prazo combinado", texto: "Cronograma claro desde o início e atualizações sempre que algo muda." },
  { titulo: "Pós-obra", texto: "Entrega com vistoria, manual do proprietário e suporte depois das chaves." },
];

export default function Sobre() {
  const ref = useRef(null);
  useRevelar(ref);

  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap.to(".sobre-visual .skyline", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: ".sobre-visual", start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: ref }
  );

  return (
    <section id="sobre" ref={ref} className="secao sobre">
      <div className="container sobre-grade">
        <div className="sobre-visual" data-revelar>
          <Skyline semente="f7-construtora" />
          <div className="sobre-flutuante">
            <strong>Do projeto à chave</strong>
            <span>uma equipe só, do começo ao fim</span>
          </div>
        </div>
        <div className="sobre-texto">
          <span className="sobrelinha" data-revelar>
            Sobre a F7
          </span>
          <h2 data-revelar>Construir bem é cuidar de cada detalhe, do alicerce ao acabamento.</h2>
          <p data-revelar>
            A F7 Engenharia Estratégica desenvolve obras residenciais e comerciais com planejamento, engenharia e acompanhamento
            próximo. Nosso compromisso é simples: entregar o que foi combinado, no prazo combinado, e manter você
            informado em cada fase.
          </p>
          <ul className="valores">
            {VALORES.map((v, i) => (
              <li key={v.titulo} data-revelar>
                <span className="valores-numero">0{i + 1}</span>
                <div>
                  <strong>{v.titulo}</strong>
                  <p>{v.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
