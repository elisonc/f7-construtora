import { useRef } from "react";
import { CartaoSpotlight, useMovimento, useRevelar } from "../../components/Efeitos.jsx";

const ITENS = [
  {
    numero: "01",
    titulo: "Planejamento",
    texto: "Orçamento, cronograma e logística definidos antes da primeira escavação, para controlar custos e prazos em todas as etapas.",
  },
  {
    numero: "02",
    titulo: "Engenharia",
    texto: "Projetos estruturais e complementares com responsável técnico, ART/RRT e execução conferida em cada fase da obra.",
  },
  {
    numero: "03",
    titulo: "Acompanhamento",
    texto: "Você acompanha tudo pela área do cliente: percentual por etapa, fotos recentes e documentos para baixar.",
  },
];

export default function Servicos() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  return (
    <section ref={ref} className="secao-escura servicos" aria-label="O que fazemos">
      <div className="container servicos-grade">
        {ITENS.map((item, i) => (
          <CartaoSpotlight key={item.numero} className="servico" data-revelar={i === 0 ? "esq" : i === 2 ? "dir" : "zoom"}>
            <span className="servico-numero">{item.numero}</span>
            <h3 data-escrever>{item.titulo}</h3>
            <p>{item.texto}</p>
          </CartaoSpotlight>
        ))}
      </div>
    </section>
  );
}
