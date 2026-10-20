import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, enviarArquivo } from "../../lib/api.js";
import { bytes, data } from "../../lib/formato.js";
import { reduzirImagem } from "../../lib/imagem.js";
import { useAviso } from "../../components/Toast.jsx";
import Carregando from "../../components/Carregando.jsx";
import BotaoConfirmar from "../../components/BotaoConfirmar.jsx";
import { CamposObra } from "./Obras.jsx";

function EditorEtapas({ etapas, aoMudar }) {
  const alterar = (i, campo, valor) => aoMudar(etapas.map((e, j) => (j === i ? { ...e, [campo]: valor } : e)));
  const mover = (i, passo) => {
    const nova = [...etapas];
    const [item] = nova.splice(i, 1);
    nova.splice(i + passo, 0, item);
    aoMudar(nova);
  };

  return (
    <div className="editor-etapas">
      {etapas.map((e, i) => (
        <div key={e.chave} className="editor-etapa">
          <input
            aria-label={`Nome da etapa ${i + 1}`}
            value={e.nome}
            maxLength={80}
            onChange={(ev) => alterar(i, "nome", ev.target.value)}
          />
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={e.percentual}
            aria-label={`Percentual de ${e.nome}`}
            onChange={(ev) => alterar(i, "percentual", Number(ev.target.value))}
          />
          <div className="editor-percentual">
            <input
              type="number"
              min={0}
              max={100}
              value={e.percentual}
              aria-label={`Percentual de ${e.nome} em número`}
              onChange={(ev) => alterar(i, "percentual", Math.min(100, Math.max(0, Number(ev.target.value) || 0)))}
            />
            <span>%</span>
          </div>
          <div className="editor-etapa-acoes">
            <button type="button" aria-label="Subir etapa" disabled={i === 0} onClick={() => mover(i, -1)}>
              ↑
            </button>
            <button type="button" aria-label="Descer etapa" disabled={i === etapas.length - 1} onClick={() => mover(i, 1)}>
              ↓
            </button>
            <button type="button" aria-label="Remover etapa" onClick={() => aoMudar(etapas.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="botao botao-fantasma botao-pequeno"
        onClick={() => aoMudar([...etapas, { chave: crypto.randomUUID(), nome: "Nova etapa", percentual: 0 }])}
      >
        + Adicionar etapa
      </button>
    </div>
  );
}

export default function ObraEditar() {
  const { id } = useParams();
  const navegar = useNavigate();
  const avisar = useAviso();
  const [obra, setObra] = useState(null);
  // null = carregando. O formulário só aparece com a lista pronta, senão o <select>
  // nasce sem opções e o navegador marca o primeiro cliente (salvar trocaria o dono da obra).
  const [clientes, setClientes] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [alterado, setAlterado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [envio, setEnvio] = useState(null);
  const [legenda, setLegenda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(
    () =>
      api(`/api/gestor/obras/${id}`)
        .then((dados) => {
          setObra(dados);
          setEtapas(dados.etapas.map((e) => ({ ...e, chave: String(e.id) })));
          setAlterado(false);
          document.title = `${dados.nome} — Painel F7`;
        })
        .catch((falha) => setErro(falha.message)),
    [id]
  );

  useEffect(() => {
    carregar();
    api("/api/gestor/clientes")
      .then(setClientes)
      .catch(() => setClientes([]));
  }, [carregar]);

  const media = useMemo(
    () => (etapas.length ? Math.round(etapas.reduce((s, e) => s + e.percentual, 0) / etapas.length) : 0),
    [etapas]
  );

  async function salvar(e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.currentTarget));
    setSalvando(true);
    try {
      await api(`/api/gestor/obras/${id}`, {
        metodo: "PUT",
        dados: { ...dados, etapas: etapas.map(({ nome, percentual }) => ({ nome, percentual })) },
      });
      avisar("Obra atualizada. O cliente já vê as mudanças.");
      await carregar();
    } catch (falha) {
      avisar(falha.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function enviarVarios(arquivos, caminho, metadados, preparar) {
    const lista = [...arquivos];
    let falhas = 0;
    for (let i = 0; i < lista.length; i++) {
      setEnvio(`Enviando ${i + 1} de ${lista.length}…`);
      try {
        const arquivo = preparar ? await preparar(lista[i]) : lista[i];
        await enviarArquivo(caminho, arquivo, metadados(lista[i]));
      } catch (falha) {
        falhas++;
        avisar(`${lista[i].name}: ${falha.message}`, "erro");
      }
    }
    setEnvio(null);
    if (falhas < lista.length) avisar(`${lista.length - falhas} arquivo(s) enviado(s).`);
    carregar();
  }

  function enviarFotos(e) {
    const arquivos = e.target.files;
    if (!arquivos?.length) return;
    enviarVarios(arquivos, `/api/gestor/obras/${id}/fotos`, () => ({ Legenda: legenda }), reduzirImagem);
    e.target.value = "";
    setLegenda("");
  }

  function enviarDocumentos(e) {
    const arquivos = e.target.files;
    if (!arquivos?.length) return;
    if (!categoria) {
      avisar("Escolha a categoria antes de enviar.", "erro");
      e.target.value = "";
      return;
    }
    enviarVarios(arquivos, `/api/gestor/obras/${id}/documentos`, (a) => ({ Categoria: categoria, "Nome-Arquivo": a.name }));
    e.target.value = "";
  }

  async function excluir(caminho, mensagem) {
    try {
      await api(caminho, { metodo: "DELETE" });
      avisar(mensagem);
      carregar();
    } catch (falha) {
      avisar(falha.message, "erro");
    }
  }

  async function excluirObra() {
    try {
      await api(`/api/gestor/obras/${id}`, { metodo: "DELETE" });
      avisar("Obra excluída.");
      navegar("/gestor/obras", { replace: true });
    } catch (falha) {
      avisar(falha.message, "erro");
    }
  }

  if (erro) return <p className="form-erro">{erro}</p>;
  if (!obra || clientes === null) return <Carregando />;

  return (
    <div className="pagina-gestor">
      <Link to="/gestor/obras" className="voltar">
        ← Todas as obras
      </Link>
      <div className="pagina-gestor-topo">
        <div>
          <h1>{obra.nome}</h1>
          <p>
            Progresso geral: <strong>{alterado ? media : obra.percentual}%</strong> (média das etapas)
            {alterado && " · não salvo"}
          </p>
        </div>
      </div>

      <form className="painel-cartao" onSubmit={salvar} onChange={() => setAlterado(true)}>
        <h2>Dados da obra</h2>
        <CamposObra key={obra.atualizado_em} obra={obra} clientes={clientes} />

        <h2 className="subtitulo-cartao">Etapas</h2>
        <p className="form-nota">Arraste o controle ou digite o percentual. O geral é a média das etapas.</p>
        <EditorEtapas
          etapas={etapas}
          aoMudar={(lista) => {
            setEtapas(lista);
            setAlterado(true);
          }}
        />
        <div className="barra-salvar">
          <span>{alterado ? "Há alterações não salvas." : "Tudo salvo."}</span>
          <button type="submit" className="botao botao-primario" disabled={salvando || !alterado}>
            {salvando ? "Salvando…" : "Salvar obra"}
          </button>
        </div>
      </form>

      <section className="painel-cartao">
        <div className="painel-cartao-topo">
          <h2>Fotos ({obra.fotos.length})</h2>
          {envio && <span className="contagem">{envio}</span>}
        </div>
        <div className="envio">
          <input
            placeholder="Legenda (opcional, vale para as fotos deste envio)"
            value={legenda}
            maxLength={140}
            onChange={(e) => setLegenda(e.target.value)}
            aria-label="Legenda das fotos"
          />
          <label className={`botao botao-contorno${envio ? " desativado" : ""}`}>
            Escolher fotos
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={Boolean(envio)} onChange={enviarFotos} />
          </label>
        </div>
        <p className="form-nota">JPG, PNG ou WebP. Fotos grandes são reduzidas automaticamente antes do envio.</p>
        {obra.fotos.length ? (
          <div className="galeria galeria-gestor">
            {obra.fotos.map((f) => (
              <figure key={f.id} className="galeria-item">
                <img src={f.url} alt={f.legenda || "Foto da obra"} loading="lazy" />
                <figcaption>
                  <span>
                    {f.legenda || "Sem legenda"}
                    <small>{data(f.criado_em)}</small>
                  </span>
                  <BotaoConfirmar
                    className="botao botao-fantasma botao-pequeno"
                    confirmar="Excluir?"
                    aoConfirmar={() => excluir(`/api/gestor/fotos/${f.id}`, "Foto excluída.")}
                  >
                    Excluir
                  </BotaoConfirmar>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="vazio-pequeno">Nenhuma foto enviada ainda.</p>
        )}
      </section>

      <section className="painel-cartao">
        <h2>Documentos ({obra.documentos.length})</h2>
        <div className="envio">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria do documento">
            <option value="">Categoria do documento</option>
            {obra.categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <label className={`botao botao-contorno${envio ? " desativado" : ""}`}>
            Escolher arquivos
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              multiple
              hidden
              disabled={Boolean(envio)}
              onChange={enviarDocumentos}
            />
          </label>
        </div>
        <p className="form-nota">PDF, JPG ou PNG, até 25 MB. Só este cliente e a equipe conseguem baixar.</p>
        {obra.documentos.length ? (
          <ul className="lista-documentos">
            {obra.documentos.map((d) => (
              <li key={d.id}>
                <span className="etiqueta">{d.categoria}</span>
                <a href={d.url} download className="lista-documentos-nome">
                  {d.nome_original}
                </a>
                <span className="lista-documentos-info">
                  {data(d.criado_em)} · {bytes(d.tamanho)}
                </span>
                <BotaoConfirmar
                  className="botao botao-fantasma botao-pequeno"
                  confirmar="Excluir?"
                  aoConfirmar={() => excluir(`/api/gestor/documentos/${d.id}`, "Documento excluído.")}
                >
                  Excluir
                </BotaoConfirmar>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vazio-pequeno">Nenhum documento enviado ainda.</p>
        )}
      </section>

      <section className="painel-cartao zona-perigo">
        <div>
          <h2>Excluir obra</h2>
          <p>Apaga a obra, as etapas, as fotos e os documentos. Não dá para desfazer.</p>
        </div>
        <BotaoConfirmar className="botao botao-perigo" confirmar="Clique de novo para excluir" aoConfirmar={excluirObra}>
          Excluir obra
        </BotaoConfirmar>
      </section>
    </div>
  );
}
