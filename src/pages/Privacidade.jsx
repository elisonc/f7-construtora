import { useEffect } from "react";
import { empresa } from "../config.js";

// Texto-base. Peça para o jurídico revisar antes de publicar.
export default function Privacidade() {
  useEffect(() => {
    document.title = "Privacidade — F7 Engenharia Estratégica";
  }, []);

  return (
    <section className="secao pagina-texto">
      <div className="container estreito">
        <span className="sobrelinha">Privacidade</span>
        <h1>Como cuidamos dos seus dados</h1>
        <p>
          Esta página explica quais dados a {empresa.nome} coleta neste site e como eles são usados, conforme a Lei
          Geral de Proteção de Dados (LGPD).
        </p>
        <h2>Formulários de contato</h2>
        <p>
          Quando você envia um formulário, guardamos nome, e-mail, telefone e mensagem para responder ao seu contato.
          Esses dados não são vendidos nem compartilhados com terceiros.
        </p>
        <h2>Área do cliente</h2>
        <p>
          Clientes com obra em andamento recebem um acesso com e-mail e senha. Fotos e documentos da obra ficam
          disponíveis só para o próprio cliente e para a equipe da {empresa.nome}.
        </p>
        <h2>Estatísticas de acesso</h2>
        <p>
          Contamos as páginas visitadas para melhorar o site. Não usamos cookies de rastreamento: o visitante é
          identificado por um código que muda todo dia e não permite saber quem você é.
        </p>
        <h2>Seus direitos</h2>
        <p>
          Você pode pedir acesso, correção ou exclusão dos seus dados pelo formulário de contato do site
          {empresa.email && (
            <>
              {" "}
              ou pelo e-mail <a href={`mailto:${empresa.email}`}>{empresa.email}</a>
            </>
          )}
          .
        </p>
      </div>
    </section>
  );
}
