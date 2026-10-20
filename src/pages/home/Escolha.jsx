import { useRef } from "react";
import Foto from "../../components/Foto.jsx";
import { useMovimento, useRevelar } from "../../components/Efeitos.jsx";

const ICONES = {
  transparencia: "M12 5C6 5 2.5 12 2.5 12S6 19 12 19s9.5-7 9.5-7S18 5 12 5zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  projetos: "M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6M12 10h0",
  qualidade: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
};

const ITENS = [
  {
    slot: "dif-1",
    icone: "transparencia",
    titulo: "Transparência e confiança",
    texto:
      "Relacionamento próximo com cada cliente. Você enxerga o andamento real da obra, com fotos e documentos sempre atualizados na área do cliente.",
  },
  {
    slot: "dif-2",
    icone: "projetos",
    titulo: "Projetos modernos",
    texto:
      "Empreendimentos que unem arquitetura contemporânea, funcionalidade e valorização imobiliária, pensados para o presente e para o futuro.",
  },
  {
    slot: "dif-3",
    icone: "qualidade",
    titulo: "Qualidade construtiva",
    texto:
      "Alto padrão de execução, materiais selecionados e foco em durabilidade, segurança e excelência no acabamento de cada detalhe.",
  },
];

export default function Escolha() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  return (
    <section ref={ref} className="secao escolha">
      <div className="container">
        <div className="escolha-topo">
          <h2 data-escrever>O que faz a F7 ser a escolha certa?</h2>
          <p data-revelar="blur">Cada projeto é desenvolvido com compromisso, qualidade e atenção aos mínimos detalhes.</p>
        </div>

        {ITENS.map((item, i) => (
          <article key={item.slot} className={`escolha-bloco${i % 2 ? " invertido" : ""}`}>
            <div className="escolha-texto">
              <span className="escolha-icone" data-revelar="zoom">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONES[item.icone]} />
                </svg>
              </span>
              <h3 data-titulo>{item.titulo}</h3>
              <p data-revelar="blur">{item.texto}</p>
            </div>
            <Foto slot={item.slot} semente={`dif-${i}-f7`} alt={item.titulo} className="escolha-foto" />
          </article>
        ))}
      </div>
    </section>
  );
}
