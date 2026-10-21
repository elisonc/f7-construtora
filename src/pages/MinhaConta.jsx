import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";
import { STATUS_OBRA, bytes, data, mesAno, primeiroNome, relativo } from "../lib/formato.js";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
import { empresa, linkWhatsApp, digitos } from "../config.js";
import Logo from "../components/Logo.jsx";
import TemaBotao from "../components/TemaBotao.jsx";
import { MarcaF7 } from "../components/Logo.jsx";
import { urlCena } from "../components/Skyline.jsx";

const CENA_DOC = {
  Contrato: "casa-branca",
  ART: "guindastes",
  RRT: "obra-estrutura",
  "Alvará": "comercial",
  Projeto: "projeto",
  "Levantamento topográfico": "projeto",
  Sondagem: "fundacao",
  "Registro de imóveis": "condominio",
  "Termo de responsabilidade": "predio-varandas",
  "Habite-se": "villa",
};
const cenaDaObra = (pct) => (pct < 20 ? "fundacao" : pct < 60 ? "obra-estrutura" : pct < 100 ? "predio-obra" : "villa");
import AnelProgresso from "../components/AnelProgresso.jsx";
import Lightbox from "../components/Lightbox.jsx";
import Carregando from "../components/Carregando.jsx";
import TrocarSenha from "../components/TrocarSenha.jsx";

export default function MinhaConta() {
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();
  const [obras, setObras] = useState(null);
  const [erro, setErro] = useState("");
  const [indice, setIndice] = useState(0);
  const [foto, setFoto] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    document.title = "Minha obra — F7 Engenharia Estratégica";
    api("/api/cliente/obras")
      .then(setObras)
      .catch((falha) => setErro(falha.message));
  }, []);

  const obra = obras?.[indice];

  useGSAP(
    () => {
      if (!obra || reduzirMovimento()) return;
      gsap.from(".conta-bloco", { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8 });
      gsap.from(".etapa-barra i", {
        scaleX: 0,
        transformOrigin: "0 50%",
        stagger: 0.07,
        duration: 1.1,
        delay: 0.35,
        ease: "power3.out",
      });
    },
    { scope: ref, dependencies: [obra?.id], revertOnUpdate: true }
  );

  const grupos = useMemo(() => {
    const mapa = new Map();
    for (const doc of obra?.documentos ?? []) {
      if (!mapa.has(doc.categoria)) mapa.set(doc.categoria, []);
      mapa.get(doc.categoria).push(doc);
    }
    return [...mapa];
  }, [obra]);

  const total = obra?.fotos.length ?? 0;
  const mudarFoto = useCallback((passo) => setFoto((i) => (i + passo + total) % total), [total]);
  const fecharFoto = useCallback(() => setFoto(null), []);

  async function sairDaConta() {
    await sair();
    navegar("/entrar", { replace: true });
  }

  return (
    <div ref={ref} className="conta">
      <header className="conta-topo">
        <div className="container conta-topo-interno">
          <Link to="/" aria-label="Site da F7 Engenharia Estratégica">
            <Logo />
          </Link>
          <div className="conta-usuario">
            <TemaBotao />
            <span>Olá, {primeiroNome(usuario.nome)}</span>
            <button type="button" className="botao botao-fantasma botao-pequeno" onClick={sairDaConta}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container conta-conteudo">
        {usuario.trocarSenha && (
          <div className="aviso-banner" role="note">
            <span>Por segurança, troque a senha provisória que você recebeu.</span>
            <a href="#senha" className="botao botao-contorno botao-pequeno">
              Trocar senha
            </a>
          </div>
        )}

        {erro && <p className="form-erro">{erro}</p>}
        {!obras && !erro && <Carregando />}

        {obras && !obras.length && (
          <section className="conta-bloco conta-vazio">
            <h1>Sua obra ainda não foi cadastrada</h1>
            <p>Assim que a equipe F7 registrar sua obra, ela aparece aqui com etapas, fotos e documentos.</p>
            {linkWhatsApp() && (
              <a className="botao botao-primario" href={linkWhatsApp("Olá! Ainda não vejo minha obra na área do cliente.")}>
                Falar com a F7
              </a>
            )}
          </section>
        )}

        {obras?.length > 1 && (
          <div className="seletor-obras" role="tablist" aria-label="Suas obras">
            {obras.map((o, i) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={i === indice}
                className={i === indice ? "ativo" : ""}
                onClick={() => setIndice(i)}
              >
                {o.nome}
              </button>
            ))}
          </div>
        )}

        {obra && (
          <>
            <section className="conta-bloco conta-resumo">
              <img className="conta-capa" src={urlCena(cenaDaObra(obra.percentual))} alt="" />
              <div className="conta-capa-veu" aria-hidden="true" />
              <div className="conta-resumo-texto">
                <span className={`etiqueta etiqueta-${obra.status}`}>{STATUS_OBRA[obra.status]}</span>
                <h1>{obra.nome}</h1>
                {obra.endereco && <p className="conta-endereco">{obra.endereco}</p>}
                <dl className="conta-datas">
                  <div>
                    <dt>Previsão de entrega</dt>
                    <dd>{mesAno(obra.previsao_entrega)}</dd>
                  </div>
                  <div>
                    <dt>Última atualização</dt>
                    <dd>{relativo(obra.atualizado_em)}</dd>
                  </div>
                </dl>
              </div>
              <div className="conta-resumo-anel">
                <AnelProgresso valor={obra.percentual} />
              </div>
            </section>

            <div className="conta-grade">
              <section className="conta-bloco">
                <h2>Etapas da obra</h2>
                <ol className="etapas">
                  {obra.etapas.map((e) => (
                    <li key={e.id} className={e.percentual === 100 ? "completa" : ""}>
                      <div className="etapa-topo">
                        <span>{e.nome}</span>
                        <strong>{e.percentual === 100 ? "Concluída" : `${e.percentual}%`}</strong>
                      </div>
                      <div className="barra etapa-barra">
                        <i style={{ width: `${e.percentual}%` }} />
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {(obra.orcado || obra.gasto) && (
                <section className="conta-bloco conta-financeiro">
                  <h2>Dados financeiros</h2>
                  <div className="financeiro-grid">
                    {obra.orcado && (
                      <div className="financeiro-card">
                        <span>Valor total orçado</span>
                        <strong>{BRL.format(obra.orcado)}</strong>
                      </div>
                    )}
                    {obra.gasto && (
                      <div className="financeiro-card">
                        <span>Gasto até agora</span>
                        <strong>{BRL.format(obra.gasto)}</strong>
                      </div>
                    )}
                    {obra.orcado && obra.gasto && (
                      <div className="financeiro-card financeiro-card-destaque">
                        <span>% do orçamento utilizado</span>
                        <strong>{Math.round((obra.gasto / obra.orcado) * 100)}%</strong>
                        <div className="barra" style={{ marginTop: 8 }}>
                          <i style={{ width: `${Math.min(100, Math.round((obra.gasto / obra.orcado) * 100))}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section className="conta-bloco conta-contato">
                <h2>Fale com a equipe</h2>
                <p>Dúvidas sobre a obra? Fale direto com quem está cuidando dela.</p>
                {linkWhatsApp() && (
                  <a
                    className="botao botao-primario botao-bloco"
                    href={linkWhatsApp(`Olá! Sou ${usuario.nome}, cliente da obra "${obra.nome}".`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Chamar no WhatsApp
                  </a>
                )}
                <ul>
                  {empresa.telefone && (
                    <li>
                      <span>Telefone</span>
                      <a href={`tel:${digitos(empresa.telefone)}`}>{empresa.telefone}</a>
                    </li>
                  )}
                  {empresa.email && (
                    <li>
                      <span>E-mail</span>
                      <a href={`mailto:${empresa.email}`}>{empresa.email}</a>
                    </li>
                  )}
                  {empresa.horario && (
                    <li>
                      <span>Atendimento</span>
                      <p>{empresa.horario}</p>
                    </li>
                  )}
                </ul>
              </section>
            </div>

            <section className="conta-bloco">
              <div className="bloco-topo">
                <h2>Fotos e vídeos</h2>
                {total > 0 && <span className="contagem">{total} arquivo(s)</span>}
              </div>
              {total ? (
                <div className="galeria">
                  {obra.fotos.map((f, i) => (
                    f.mime?.startsWith("video/") ? (
                      <div key={f.id} className="galeria-item galeria-video">
                        <video src={f.url} controls preload="metadata" />
                        <span>
                          {f.legenda || "Vídeo da obra"}
                          <small>{data(f.criado_em)}</small>
                        </span>
                      </div>
                    ) : (
                    <button key={f.id} type="button" className="galeria-item" onClick={() => setFoto(i)}>
                      <img src={f.url} alt={f.legenda || "Foto da obra"} loading="lazy" />
                      <span>
                        {f.legenda || "Foto da obra"}
                        <small>{data(f.criado_em)}</small>
                      </span>
                    </button>
                    )
                  ))}
                </div>
              ) : (
                <p className="vazio-pequeno">As fotos e vídeos aparecem aqui assim que a equipe enviar.</p>
              )}
            </section>

            <section className="conta-bloco">
              <div className="bloco-topo">
                <h2>Documentos</h2>
                {obra.documentos.length > 0 && <span className="contagem">{obra.documentos.length} arquivo(s)</span>}
              </div>
              {grupos.length ? (
                <div className="documentos">
                  {grupos.map(([categoria, docs]) => (
                    <div key={categoria} className="doc-cartao">
                      <img src={urlCena(CENA_DOC[categoria] ?? "predio-pronto", true)} alt="" loading="lazy" />
                      <div className="doc-veu" aria-hidden="true" />
                      <div className="doc-conteudo">
                        <MarcaF7 className="doc-marca" />
                        <h3>{categoria}</h3>
                        {docs.map((d) => (
                          <a key={d.id} href={d.url} className="doc-botao" download title={d.nome_original}>
                            <span>Baixar {categoria.toLowerCase()}</span>
                            <small>
                              {d.nome_original} · {bytes(d.tamanho)}
                            </small>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="vazio-pequeno">Os documentos da obra aparecem aqui quando forem enviados.</p>
              )}
            </section>
          </>
        )}

        <section id="senha" className="conta-bloco">
          <h2>Minha senha</h2>
          <TrocarSenha />
        </section>
      </main>

      {foto !== null && obra && (
        <Lightbox fotos={obra.fotos} indice={foto} aoFechar={fecharFoto} aoMudar={mudarFoto} />
      )}
    </div>
  );
}
