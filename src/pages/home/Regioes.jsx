import { useRef } from "react";
import { regioes } from "../../config.js";
import { useMovimento, useRevelar } from "../../components/Efeitos.jsx";

export default function Regioes() {
  const ref = useRef(null);
  useRevelar(ref);
  useMovimento(ref);

  return (
    <section ref={ref} className="secao regioes-home">
      <div className="container centro">
        <span className="sobrelinha" data-revelar>
          Regiões de atuação
        </span>
        <h2 data-titulo>Presença no Paraná</h2>
        <ul className="regioes-lista">
          {regioes.map((r) => (
            <li key={r} data-revelar="zoom">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
