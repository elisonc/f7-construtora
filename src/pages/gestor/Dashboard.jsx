import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { STATUS_LEAD, numero, relativo } from "../../lib/formato.js";
import { Contador } from "../../components/Efeitos.jsx";
import { GraficoAcessos, BarrasHorizontais } from "../../components/Graficos.jsx";
import Carregando from "../../components/Carregando.jsx";

const PERIODOS = [7, 30, 90];

function Variacao({ atual, anterior }) {
  if (!anterior) return <span className="variacao neutra">sem comparação ainda</span>;
  const delta = Math.round(((atual - anterior) / anterior) * 100);
  const sinal = delta > 0 ? "▲" : delta < 0 ? "▼" : "■";
  const classe = delta > 0 ? "sobe" : delta < 0 ? "desce" : "neutra";
  return (
    <span className={`variacao ${classe}`}>
      {sinal} {Math.abs(delta)}% vs período anterior
    </span>
  );
}

function Indicador({ rotulo, valor, detalhe, destaque = false, children }) {
  return (
    <div className={`indicador${destaque ? " destaque" : ""}`}>
      <span className="indicador-rotulo">{rotulo}</span>
      <strong className="indicador-valor">
        <Contador valor={valor} aoRolar={false} />
      </strong>
      {children}
      {detalhe && <span className="indicador-detalhe">{detalhe}</span>}
    </div>
  );
}

export default function Dashboard() {
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    document.title = "Dashboard — Painel F7";
    let ativo = true;
    api(`/api/gestor/dashboard?dias=${dias}`)
      .then((d) => ativo && setDados(d))
      .catch((falha) => ativo && setErro(falha.message));
    return () => {
      ativo = false;
    };
  }, [dias]);

  if (erro) return <p className="form-erro">{erro}</p>;
  if (!dados) return <Carregando />;

  const { visitas, clientes, obras, leads } = dados;
  const nomesDispositivo = { mobile: "Celular", desktop: "Computador" };

  return (
    <div className="pagina-gestor">
      <div className="pagina-gestor-topo">
        <div>
          <h1>Visão geral</h1>
          <p>Acessos ao site, clientes e obras dos últimos {dias} dias.</p>
        </div>
        <div className="pagina-gestor-acoes">
          <div className="segmentado" role="group" aria-label="Período">
            {PERIODOS.map((p) => (
              <button key={p} type="button" className={p === dias ? "ativo" : ""} onClick={() => setDias(p)}>
                {p} dias
              </button>
            ))}
          </div>
          <Link to="/gestor/clientes?novo=1" className="botao botao-primario botao-pequeno">
            + Cadastrar cliente
          </Link>
        </div>
      </div>

      <div className="indicadores">
        <Indicador rotulo="Acessos ao site" valor={visitas.total} destaque>
          <Variacao atual={visitas.total} anterior={visitas.periodoAnterior} />
        </Indicador>
        <Indicador rotulo="Visitantes" valor={visitas.visitantes} detalhe={`${numero(visitas.hoje)} acessos hoje`} />
        <Indicador
          rotulo="Clientes cadastrados"
          valor={clientes.total}
          detalhe={`${numero(clientes.novos)} novos no período · ${numero(clientes.ativos)} ativos`}
        />
        <Indicador
          rotulo="Clientes que entraram na área"
          valor={clientes.clientes}
          detalhe={`${numero(clientes.logins)} acessos à área do cliente`}
        />
        <Indicador
          rotulo="Obras em andamento"
          valor={obras.andamento}
          detalhe={`média de ${obras.mediaProgresso}% concluído · ${numero(obras.concluidas)} concluídas`}
        />
        <Indicador
          rotulo="Contatos recebidos"
          valor={leads.periodo}
          detalhe={`${numero(leads.novos)} aguardando retorno`}
        />
      </div>

      <section className="painel-cartao">
        <div className="painel-cartao-topo">
          <h2>Acessos por dia</h2>
          <span className="painel-cartao-nota">Contagem sem cookies; visitas da equipe não entram.</span>
        </div>
        {visitas.total ? (
          <GraficoAcessos serie={visitas.serie} />
        ) : (
          <p className="vazio-pequeno">
            Ainda não há acessos registrados neste período. Eles aparecem aqui assim que o site receber visitas.
          </p>
        )}
      </section>

      <div className="painel-grade-3">
        <section className="painel-cartao">
          <h2>Páginas mais vistas</h2>
          <BarrasHorizontais itens={visitas.paginas.map((p) => ({ rotulo: p.caminho, valor: p.visitas }))} />
        </section>
        <section className="painel-cartao">
          <h2>De onde vêm</h2>
          <BarrasHorizontais itens={visitas.origens.map((o) => ({ rotulo: o.origem, valor: o.visitas }))} />
        </section>
        <section className="painel-cartao">
          <h2>Dispositivo</h2>
          <BarrasHorizontais
            itens={visitas.dispositivos.map((d) => ({
              rotulo: nomesDispositivo[d.dispositivo] ?? d.dispositivo,
              valor: d.visitas,
              mostrarPercentual: true,
            }))}
          />
        </section>
      </div>

      <div className="painel-grade-2">
        <section className="painel-cartao">
          <div className="painel-cartao-topo">
            <h2>Últimos clientes</h2>
            <Link to="/gestor/clientes" className="link-suave">
              Ver todos
            </Link>
          </div>
          {dados.ultimosClientes.length ? (
            <ul className="lista-simples">
              {dados.ultimosClientes.map((c) => (
                <li key={c.id}>
                  <div>
                    <strong>{c.nome}</strong>
                    <span>{c.email}</span>
                  </div>
                  <span className="lista-simples-lado">Último acesso: {relativo(c.ultimo_acesso)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="vazio-pequeno">Nenhum cliente cadastrado ainda.</p>
          )}
        </section>
        <section className="painel-cartao">
          <div className="painel-cartao-topo">
            <h2>Últimos contatos</h2>
            <Link to="/gestor/contatos" className="link-suave">
              Ver todos
            </Link>
          </div>
          {dados.ultimosLeads.length ? (
            <ul className="lista-simples">
              {dados.ultimosLeads.map((l) => (
                <li key={l.id}>
                  <div>
                    <strong>{l.nome}</strong>
                    <span>{l.interesse || "Sem interesse informado"}</span>
                  </div>
                  <span className={`etiqueta etiqueta-${l.status}`}>{STATUS_LEAD[l.status]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="vazio-pequeno">Nenhum contato recebido ainda.</p>
          )}
        </section>
      </div>
    </div>
  );
}
