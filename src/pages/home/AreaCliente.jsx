import { useRef } from "react";
import { Link } from "react-router";
import AnelProgresso from "../../components/AnelProgresso.jsx";
import { Magnetico, useRevelar } from "../../components/Efeitos.jsx";
import { gsap, useGSAP, reduzirMovimento } from "../../lib/gsap.js";

const ETAPAS_DEMO = [
  { nome: "Fundação", valor: 100 },
  { nome: "Estrutura", valor: 90 },
  { nome: "Alvenaria", valor: 65 },
  { nome: "Acabamento", valor: 20 },
];

export default function AreaCliente() {
  const ref = useRef(null);
  useRevelar(ref);

  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap.from(".demo-barra i", {
        scaleX: 0,
        transformOrigin: "0 50%",
        stagger: 0.12,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".demo-painel", start: "top 80%", once: true },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="secao area-cliente">
      <div className="container area-grade">
        <div>
          <span className="sobrelinha" data-revelar>
            Área do cliente
          </span>
          <h2 data-revelar>Sua obra na palma da mão.</h2>
          <p data-revelar>
            Cada cliente F7 recebe um acesso exclusivo para acompanhar a obra de onde estiver, sem precisar ligar para
            perguntar.
          </p>
          <ul className="lista-check">
            <li data-revelar>Percentual geral e de cada etapa</li>
            <li data-revelar>Fotos atualizadas da obra</li>
            <li data-revelar>Contrato, ART, alvará e projetos para baixar</li>
            <li data-revelar>Contato direto com a equipe</li>
          </ul>
          <div data-revelar>
            <Magnetico>
              <Link to="/entrar" className="botao botao-primario">
                Acessar área do cliente
              </Link>
            </Magnetico>
          </div>
        </div>

        <div className="demo-painel" data-revelar aria-hidden="true">
          <div className="demo-inclinado">
          <div className="demo-topo">
            <span className="demo-ponto" />
            <span className="demo-ponto" />
            <span className="demo-ponto" />
            <span className="demo-titulo">Minha obra</span>
          </div>
          <div className="demo-corpo">
            <AnelProgresso valor={72} tamanho={150} espessura={10} aoRolar />
            <div className="demo-etapas">
              {ETAPAS_DEMO.map((e) => (
                <div key={e.nome} className="demo-etapa">
                  <div className="demo-etapa-topo">
                    <span>{e.nome}</span>
                    <span>{e.valor}%</span>
                  </div>
                  <div className="demo-barra">
                    <i style={{ width: `${e.valor}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="demo-fotos">
            <span />
            <span />
            <span />
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
