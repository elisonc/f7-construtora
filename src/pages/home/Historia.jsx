import { useRef } from "react";
import { Link } from "react-router";
import Foto from "../../components/Foto.jsx";
import { useMovimento, useRevelar } from "../../components/Efeitos.jsx";

export default function Historia() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  return (
    <section id="sobre" ref={ref} className="secao historia">
      <div className="container historia-grade">
        <Foto slot="historia" semente="historia-f7" alt="Obra da F7 Engenharia Estratégica" className="historia-foto" />
        <div className="historia-texto">
          <span className="sobrelinha" data-revelar>
            Sobre a F7
          </span>
          <h2 data-titulo>A história da F7 Engenharia Estratégica</h2>
          <p data-revelar="blur">
            A F7 nasceu para transformar projetos em lugares onde as pessoas vivem e investem com tranquilidade.
            Construímos com engenharia responsável, planejamento rigoroso e atenção a cada detalhe, do alicerce ao
            acabamento.
          </p>
          <p data-revelar="blur">
            Nosso compromisso é simples: entregar o que foi combinado, no prazo combinado, e manter você informado em
            todas as fases, com fotos, percentual de andamento e documentos disponíveis online.
          </p>
          <div data-revelar>
            <Link to="/#contato" className="botao botao-contorno">
              Fale com a gente
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
