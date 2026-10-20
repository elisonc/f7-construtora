import { useRef } from "react";
import { numeros } from "../../config.js";
import { Contador, useRevelar } from "../../components/Efeitos.jsx";

export default function Numeros() {
  const ref = useRef(null);
  useRevelar(ref);
  if (!numeros.length) return null;

  return (
    <section ref={ref} className="numeros" aria-label="F7 em números">
      <div className="container numeros-grade">
        {numeros.map((n) => (
          <div key={n.rotulo} className="numero" data-revelar>
            <strong>
              <Contador valor={n.valor} sufixo={n.sufixo} />
            </strong>
            <span>{n.rotulo}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
