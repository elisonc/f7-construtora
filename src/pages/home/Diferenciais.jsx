import { useRef } from "react";
import { CartaoSpotlight, useRevelar } from "../../components/Efeitos.jsx";

const ICONES = {
  engenharia: "M4 20h16M6 20V9l6-5 6 5v11M10 20v-6h4v6",
  materiais: "M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4",
  cronograma: "M7 3v3M17 3v3M4 8h16M5 5h14v15H5zM9 13l2 2 4-4",
  documentos: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  atendimento: "M4 5h16v11H8l-4 4zM8 9h8M8 12h5",
  garantia: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
};

const ITENS = [
  { icone: "engenharia", titulo: "Engenharia responsável", texto: "Projeto e execução com responsável técnico e registro em conselho." },
  { icone: "materiais", titulo: "Materiais de procedência", texto: "Fornecedores avaliados e materiais conferidos antes de entrar na obra." },
  { icone: "cronograma", titulo: "Cronograma transparente", texto: "Etapas com prazo e percentual atualizados para você acompanhar." },
  { icone: "documentos", titulo: "Documentação em dia", texto: "Contrato, ART, alvará e projetos organizados e disponíveis online." },
  { icone: "atendimento", titulo: "Atendimento direto", texto: "Fale com quem cuida da sua obra, sem intermediários." },
  { icone: "garantia", titulo: "Garantia e pós-obra", texto: "Suporte depois da entrega, dentro do prazo de garantia da obra." },
];

export default function Diferenciais() {
  const ref = useRef(null);
  useRevelar(ref);

  return (
    <section ref={ref} className="secao diferenciais">
      <div className="container">
        <div className="secao-topo centro">
          <div>
            <span className="sobrelinha" data-revelar>
              Por que a F7
            </span>
            <h2 data-revelar>O que você ganha construindo com a gente.</h2>
          </div>
        </div>
        <div className="grade-diferenciais">
          {ITENS.map((item) => (
            <CartaoSpotlight key={item.titulo} className="diferencial" data-revelar>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={ICONES[item.icone]} />
              </svg>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </CartaoSpotlight>
          ))}
        </div>
      </div>
    </section>
  );
}
