import { useRef } from "react";
import { Link } from "react-router";
import { Magnetico, useMovimento, useRevelar } from "../../components/Efeitos.jsx";
import { MarcaF7 } from "../../components/Logo.jsx";

export default function Chamada() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  return (
    <section ref={ref} className="cta-faixa" aria-label="Fale com a F7">
      <MarcaF7 className="cta-marca" />
      <div className="container centro">
        <h2 data-escrever>Transforme seu projeto em realidade hoje</h2>
        <p data-revelar="blur">Fale com a nossa equipe e descubra como podemos construir o seu empreendimento.</p>
        <div data-revelar="zoom">
          <Magnetico>
            <Link to="/#contato" className="botao botao-primario">
              Entre em contato
            </Link>
          </Magnetico>
        </div>
      </div>
    </section>
  );
}
