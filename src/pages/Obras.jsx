import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import Skyline from "../components/Skyline.jsx";
import { useMovimento, useRevelar } from "../components/Efeitos.jsx";
import NaoEncontrado from "./NaoEncontrado.jsx";

export function CartaoObra({ item }) {
  const andamento = item.status === "em_obras";
  return (
    <Link to={`/empreendimentos/${item.slug}`} className="projeto" data-revelar>
      <div className="projeto-imagem">
        {item.capaMini ? <img src={item.capaMini} alt={`${item.nome}`} loading="lazy" decoding="async" /> : <Skyline semente={item.slug} mini />}
        <span className={`etiqueta ${andamento ? "etiqueta-em_obras" : "etiqueta-entregue"}`}>
          {andamento ? "Em andamento" : "Concluída"}
        </span>
      </div>
      <h3>{item.nome}</h3>
      {item.local && <span className="projeto-local">{item.local}</span>}
      <p>{item.resumo}</p>
      {andamento && item.percentual != null && (
        <div className="projeto-andamento" aria-label={`${item.percentual}% da obra concluída`}>
          <div className="projeto-andamento-topo">
            <span>Andamento da obra</span>
            <strong>{item.percentual}%</strong>
          </div>
          <div className="barra">
            <i style={{ width: `${item.percentual}%` }} />
          </div>
        </div>
      )}
      <ul className="projeto-dados">
        {item.unidades && <li>{item.unidades}</li>}
        {item.entrega && (
          <li>
            {andamento ? "Entrega prevista:" : "Entregue em"} {item.entrega}
          </li>
        )}
      </ul>
      <span className="botao botao-primario botao-pequeno">
        Ver detalhes <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

const TIPOS = {
  andamento: {
    status: "em_obras",
    titulo: "Obras em andamento",
    texto: "Planejamento, execução e acompanhamento em cada etapa da obra, desde a concepção até a execução, com toda a dedicação e empenho da nossa equipe.",
    vazio: "No momento não há obras em andamento cadastradas.",
  },
  concluidas: {
    status: "entregue",
    titulo: "Obras concluídas",
    texto: "Portfólio de empreendimentos entregues ao longo da nossa trajetória: mais de 900 unidades, no prazo, com qualidade e sem surpresas.",
    vazio: "No momento não há obras concluídas cadastradas.",
  },
};

export default function Obras() {
  const { tipo } = useParams();
  const config = TIPOS[tipo];
  const [lista, setLista] = useState(null);
  const ref = useRef(null);
  useRevelar(ref, [lista, tipo]);
  useMovimento(ref, [tipo]);

  useEffect(() => {
    if (!config) return;
    document.title = `${config.titulo} — F7 Engenharia Estratégica`;
    setLista(null);
    api("/api/empreendimentos")
      .then((todas) => setLista(todas.filter((o) => o.status === config.status)))
      .catch(() => setLista([]));
  }, [config, tipo]);

  if (!config) return <NaoEncontrado />;

  return (
    <div ref={ref}>
      <header className="obras-topo secao-escura">
        <div className="container">
          <span className="sobrelinha">Obras</span>
          <h1 data-titulo>{config.titulo}</h1>
          <p data-revelar="blur">{config.texto}</p>
          <nav className="obras-abas" aria-label="Tipo de obra">
            <Link to="/obras/andamento" className={tipo === "andamento" ? "ativa" : ""}>
              Em andamento
            </Link>
            <Link to="/obras/concluidas" className={tipo === "concluidas" ? "ativa" : ""}>
              Concluídas
            </Link>
          </nav>
        </div>
      </header>
      <section className="secao obras-lista">
        <div className="container">
          {lista === null ? (
            <div className="grade-obras-site">
              {[1, 2, 3].map((i) => (
                <div key={i} className="projeto esqueleto" />
              ))}
            </div>
          ) : lista.length ? (
            <div className="grade-obras-site">
              {lista.map((item) => (
                <CartaoObra key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="vazio">{config.vazio}</p>
          )}
        </div>
      </section>
    </div>
  );
}
