import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { STATUS_EMPREENDIMENTO } from "../lib/formato.js";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";
import Skyline from "../components/Skyline.jsx";
import FormContato from "../components/FormContato.jsx";
import Carregando from "../components/Carregando.jsx";
import NaoEncontrado from "./NaoEncontrado.jsx";

export default function Empreendimento() {
  const { slug } = useParams();
  const [item, setItem] = useState(undefined);
  const ref = useRef(null);

  useEffect(() => {
    setItem(undefined);
    api(`/api/empreendimentos/${encodeURIComponent(slug)}`)
      .then((dados) => {
        setItem(dados);
        document.title = `${dados.nome} — F7 Engenharia Estratégica`;
      })
      .catch(() => setItem(null));
  }, [slug]);

  useGSAP(
    () => {
      if (!item || reduzirMovimento()) return;
      gsap
        .timeline()
        .from(".emp-banner-midia", { scale: 1.12, duration: 1.6, ease: "power3.out" })
        .from(".emp-banner-texto > *", { y: 30, autoAlpha: 0, stagger: 0.08 }, 0.2)
        .from(".emp-ficha li", { y: 20, autoAlpha: 0, stagger: 0.06 }, 0.5)
        .from(".emp-corpo > *", { y: 24, autoAlpha: 0, stagger: 0.08 }, 0.6);
    },
    // revertOnUpdate desfaz a animação anterior antes de recriar (evita o from() começar do estado escondido).
    { scope: ref, dependencies: [item?.id], revertOnUpdate: true }
  );

  if (item === undefined) return <Carregando tela />;
  if (item === null) return <NaoEncontrado />;

  const andamento = item.status === "em_obras";
  const ficha = [
    ["Situação", andamento ? "Em andamento" : "Concluída"],
    [andamento ? "Entrega prevista" : "Entregue em", item.entrega],
    ["Unidades", item.unidades],
    ["Metragem", item.area],
    ["Localização", item.local],
    ["Endereço", item.endereco],
  ].filter(([, valor]) => valor);

  return (
    <article ref={ref} className="emp-pagina">
      <header className="emp-banner">
        <div className="emp-banner-midia">
          {item.capa ? <img src={item.capa} alt="" /> : <Skyline semente={item.slug} />}
        </div>
        <div className="container emp-banner-texto">
          <Link to={andamento ? "/obras/andamento" : "/obras/concluidas"} className="voltar">
            ← {andamento ? "Obras em andamento" : "Obras concluídas"}
          </Link>
          <span className={`etiqueta etiqueta-${item.status}`}>{andamento ? "Em andamento" : "Concluída"}</span>
          <h1>{item.nome}</h1>
          {item.local && <p className="emp-local">{item.local}</p>}
        </div>
      </header>

      <div className="container emp-grade">
        <div className="emp-corpo">
          {ficha.length > 0 && (
            <ul className="emp-ficha">
              {ficha.map(([rotulo, valor]) => (
                <li key={rotulo}>
                  <span>{rotulo}</span>
                  <strong>{valor}</strong>
                </li>
              ))}
            </ul>
          )}
          {andamento && item.percentual != null && (
            <div className="emp-andamento">
              <div className="projeto-andamento-topo">
                <span>Andamento da obra</span>
                <strong>{item.percentual}% concluído</strong>
              </div>
              <div className="barra">
                <i style={{ width: `${item.percentual}%` }} />
              </div>
            </div>
          )}
          {item.resumo && <p className="emp-resumo">{item.resumo}</p>}
          {(item.descricao || "").split(/\n+/).filter(Boolean).map((paragrafo, i) => (
            <p key={i}>{paragrafo}</p>
          ))}
        </div>
        <aside className="emp-lateral">
          <div className="cartao-form">
            <FormContato
              titulo="Quero saber mais"
              origem={`Página: ${item.nome}`}
              interessePadrao={item.nome}
              compacto
            />
          </div>
        </aside>
      </div>
    </article>
  );
}
