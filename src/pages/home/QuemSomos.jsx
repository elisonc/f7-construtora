import { useRef } from "react";
import Foto from "../../components/Foto.jsx";
import { useMovimento, useRevelar } from "../../components/Efeitos.jsx";

export default function QuemSomos() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  return (
    <section id="sobre" ref={ref} className="secao historia">
      <div className="container historia-grade">
        <Foto slot="historia" semente="chronos" alt="Chronos, obra entregue pela F7 Engenharia Estratégica" className="historia-foto" />
        <div className="historia-texto">
          <span className="sobrelinha" data-revelar>
            Quem somos
          </span>
          <h2 data-titulo>F7 Engenharia Estratégica: construímos com quem constrói</h2>
          <p data-revelar="blur">
            Há mais de 20 anos, a F7 faz uma coisa muito bem: levantar grandes obras para construtoras e incorporadoras
            que precisam de um parceiro em quem possam confiar.
          </p>
          <p data-revelar="blur">
            Começamos com um princípio simples: obra boa é obra entregue no prazo, com qualidade e sem surpresas. Esse
            princípio nos acompanhou em cada canteiro, em cada contrato e em cada entrega. Com o tempo, ele virou nossa
            reputação.
          </p>
          <p data-revelar="blur">
            Sabemos que, quando um parceiro nos contrata, ele coloca o próprio nome em nossas mãos. Por isso tratamos
            cada obra como se fosse nossa. Planejamos com rigor, executamos com disciplina e comunicamos com
            transparência, do primeiro dia até a entrega das chaves.
          </p>
          <p data-revelar="blur">
            Nosso diferencial não está só no que construímos, mas em como nos relacionamos. Dedicação para resolver,
            seriedade para cumprir o combinado e compromisso para ir até o fim. É isso que faz nossos clientes voltarem
            e nos indicarem.
          </p>
          <p data-revelar="blur">
            <strong>
              São mais de duas décadas de obras entregues e de parcerias que se renovam. Para a construtora que precisa
              de prazo cumprido, qualidade garantida e um parceiro que honra a palavra, a resposta é F7 Engenharia
              Estratégica.
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}
