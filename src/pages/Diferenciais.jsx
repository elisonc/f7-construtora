import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { CartaoSpotlight, useMovimento, useRevelar } from "../components/Efeitos.jsx";
import { regioes } from "../config.js";

const ICONE = {
  selo: "M12 3l2.6 1.7 3.1.1 1.3 2.8 2.4 2-.9 3 .9 3-2.4 2-1.3 2.8-3.1.1L12 21l-2.6-1.7-3.1-.1-1.3-2.8-2.4-2 .9-3-.9-3 2.4-2 1.3-2.8 3.1-.1zM8.5 12.2l2.4 2.4 4.6-4.9",
  pessoas: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.9M15.5 3.1a3.5 3.5 0 0 1 0 6.8",
  escudo: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  capacete: "M4 17v-2a8 8 0 0 1 16 0v2M2 17h20v3H2zM12 7v4M8 8.5l1.5 2M16 8.5L14.5 10.5",
  mapa: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  relogio: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
};

function Icone({ nome }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="dif-icone">
      <path d={ICONE[nome]} />
    </svg>
  );
}

export default function Diferenciais() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  useEffect(() => {
    document.title = "Diferenciais — F7 Engenharia Estratégica";
  }, []);

  return (
    <div ref={ref}>
      <header className="obras-topo secao-escura">
        <div className="container">
          <span className="sobrelinha">Diferenciais</span>
          <h1 data-titulo>Por que construir com a F7</h1>
          <p data-revelar="blur">
            Certificações reconhecidas, equipe própria e uma diretoria que acompanha cada projeto junto com o cliente.
          </p>
        </div>
      </header>

      <section id="certificados" className="secao dif-secao">
        <div className="container">
          <h2 data-titulo>Certificados</h2>
          <div className="dif-grade">
            <CartaoSpotlight className="dif-cartao" data-revelar="zoom">
              <Icone nome="selo" />
              <h3>ISO 9001</h3>
              <p>
                Gestão da qualidade certificada: processos padronizados, controle documentado e melhoria contínua em
                todas as etapas da obra.
              </p>
            </CartaoSpotlight>
            <CartaoSpotlight className="dif-cartao" data-revelar="zoom">
              <Icone nome="selo" />
              <h3>PBQP-H nível A+</h3>
              <p>
                Programa Brasileiro da Qualidade e Produtividade do Habitat, no nível máximo (A+) de conformidade do
                sistema de gestão da qualidade em obras.
              </p>
            </CartaoSpotlight>
          </div>
        </div>
      </section>

      <section id="atendimento" className="secao dif-secao dif-clara">
        <div className="container">
          <h2 data-titulo>Atendimento personalizado</h2>
          <div className="dif-grade tres">
            <CartaoSpotlight className="dif-cartao" data-revelar="esq">
              <Icone nome="pessoas" />
              <h3>Atendimento direto</h3>
              <p>Você fala com quem decide e com quem executa, sem intermediários e sem filas de chamado.</p>
            </CartaoSpotlight>
            <CartaoSpotlight className="dif-cartao" data-revelar="zoom">
              <Icone nome="relogio" />
              <h3>Estrutura enxuta</h3>
              <p>Menos camadas, mais agilidade: as decisões acontecem rápido e o combinado vira prática.</p>
            </CartaoSpotlight>
            <CartaoSpotlight className="dif-cartao" data-revelar="dir">
              <Icone nome="capacete" />
              <h3>Diretoria junto com o cliente</h3>
              <p>A diretoria acompanha os projetos ao lado dos clientes, da primeira reunião à entrega das chaves.</p>
            </CartaoSpotlight>
          </div>
        </div>
      </section>

      <section id="seguro" className="secao dif-secao">
        <div className="container">
          <h2 data-titulo>Seguro de entrega e pós-obra</h2>
          <div className="dif-grade">
            <CartaoSpotlight className="dif-cartao" data-revelar="zoom">
              <Icone nome="escudo" />
              <h3>Todas as obras seguradas</h3>
              <p>Seguro de entrega e de pós-obra em todas as obras: tranquilidade para a construtora, para o incorporador e para quem compra.</p>
            </CartaoSpotlight>
            <CartaoSpotlight className="dif-cartao" data-revelar="zoom">
              <Icone nome="relogio" />
              <h3>Mais de 20 anos de estrada</h3>
              <p>Desde 2006, mais de 900 unidades entregues e parcerias que se renovam a cada novo empreendimento.</p>
            </CartaoSpotlight>
          </div>
        </div>
      </section>

      <section id="equipe" className="secao dif-secao dif-clara">
        <div className="container">
          <h2 data-titulo>Equipe própria de obra</h2>
          <div className="dif-grade">
            <CartaoSpotlight className="dif-cartao" data-revelar="esq">
              <Icone nome="capacete" />
              <h3>Gerenciamento de execução próprio</h3>
              <p>Equipe interna de gerenciamento de execução de obras: arquitetos, engenheiros e canteiros com treinamento e qualificação contínua.</p>
            </CartaoSpotlight>
            <CartaoSpotlight className="dif-cartao" data-revelar="dir">
              <Icone nome="selo" />
              <h3>Planejamento e controle</h3>
              <p>Planejamento rigoroso, controle de custos e prazos e comunicação transparente em todas as fases.</p>
            </CartaoSpotlight>
          </div>
        </div>
      </section>

      <section id="regioes" className="secao dif-secao">
        <div className="container">
          <h2 data-titulo>Onde atuamos</h2>
          <p data-revelar="blur">Presença no Paraná:</p>
          <ul className="regioes-lista">
            {regioes.map((r) => (
              <li key={r} data-revelar="zoom">
                <Icone nome="mapa" />
                {r}
              </li>
            ))}
          </ul>
          <div data-revelar>
            <Link to="/#contato" className="botao botao-primario">
              Fale com a nossa diretoria
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
