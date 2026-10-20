import { useRef } from "react";
import { Link } from "react-router";
import { numeros } from "../../config.js";
import { Contador, useMovimento, useRevelar } from "../../components/Efeitos.jsx";

const SELOS = [
  { titulo: "ISO 9001", texto: "Gestão da qualidade certificada" },
  { titulo: "PBQP-H A+", texto: "Nível máximo de conformidade" },
  { titulo: "Seguro de entrega e pós-obra", texto: "Em todas as obras" },
  { titulo: "Equipe própria de obra", texto: "Gerenciamento de execução interno" },
];

export default function DiferenciaisHome() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  return (
    <section ref={ref} className="secao dif-home" aria-label="Diferenciais e números">
      <div className="container">
        <div className="numeros-grade numeros-flat">
          {numeros.map((n) => (
            <div key={n.rotulo} className="numero" data-revelar="zoom">
              <strong>
                <Contador valor={n.valor} sufixo={n.sufixo} />
              </strong>
              <span>{n.rotulo}</span>
            </div>
          ))}
        </div>

        <div className="secao-topo centro">
          <div>
            <span className="sobrelinha" data-revelar>
              Diferenciais
            </span>
            <h2 data-titulo>Qualidade comprovada, parceria de verdade</h2>
          </div>
        </div>

        <div className="selos-grade">
          {SELOS.map((s) => (
            <div key={s.titulo} className="selo" data-revelar="zoom">
              <span className="selo-marca" aria-hidden="true" />
              <strong>{s.titulo}</strong>
              <span>{s.texto}</span>
            </div>
          ))}
        </div>

        <div className="centro" data-revelar>
          <Link to="/diferenciais" className="botao botao-contorno">
            Conheça todos os diferenciais
          </Link>
        </div>
      </div>
    </section>
  );
}
