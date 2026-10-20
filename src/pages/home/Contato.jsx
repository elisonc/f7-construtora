import { useRef } from "react";
import FormContato from "../../components/FormContato.jsx";
import { useRevelar } from "../../components/Efeitos.jsx";
import { empresa, linkWhatsApp, digitos } from "../../config.js";

export default function Contato({ opcoes }) {
  const ref = useRef(null);
  useRevelar(ref);

  const canais = [
    linkWhatsApp() && { rotulo: "WhatsApp", el: <a href={linkWhatsApp()} target="_blank" rel="noreferrer">Conversar agora</a> },
    empresa.telefone && { rotulo: "Telefone", el: <a href={`tel:${digitos(empresa.telefone)}`}>{empresa.telefone}</a> },
    empresa.email && { rotulo: "E-mail", el: <a href={`mailto:${empresa.email}`}>{empresa.email}</a> },
    empresa.endereco && { rotulo: "Endereço", el: <p>{empresa.endereco}</p> },
  ].filter(Boolean);

  return (
    <section id="contato" ref={ref} className="secao contato">
      <div className="container contato-grade">
        <div>
          <span className="sobrelinha" data-revelar>
            Contato
          </span>
          <h2 data-revelar>Vamos tirar seu projeto do papel?</h2>
          <p data-revelar>Conte o que você precisa. Respondemos em até um dia útil.</p>
          {canais.length > 0 && (
            <ul className="contato-canais">
              {canais.map((c) => (
                <li key={c.rotulo} data-revelar>
                  <span>{c.rotulo}</span>
                  {c.el}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="contato-form" data-revelar>
          <FormContato origem="Formulário do site" opcoes={opcoes} />
        </div>
      </div>
    </section>
  );
}
