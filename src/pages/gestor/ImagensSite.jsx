import { useCallback, useEffect, useState } from "react";
import { api, enviarArquivo } from "../../lib/api.js";
import { reduzirImagem } from "../../lib/imagem.js";
import { useAviso } from "../../components/Toast.jsx";
import Carregando from "../../components/Carregando.jsx";
import BotaoConfirmar from "../../components/BotaoConfirmar.jsx";
import Skyline from "../../components/Skyline.jsx";

export default function ImagensSite() {
  const avisar = useAviso();
  const [lista, setLista] = useState(null);
  const [enviando, setEnviando] = useState("");

  const carregar = useCallback(
    () =>
      api("/api/gestor/site/imagens")
        .then(setLista)
        .catch((falha) => avisar(falha.message, "erro")),
    [avisar]
  );

  useEffect(() => {
    document.title = "Imagens do site — Painel F7";
    carregar();
  }, [carregar]);

  async function enviar(slot, e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setEnviando(slot);
    try {
      const ehLogo = slot.startsWith("logo");
      await enviarArquivo(`/api/gestor/site/imagens/${slot}`, ehLogo ? arquivo : await reduzirImagem(arquivo, 2400));
      avisar("Imagem atualizada no site.");
      await carregar();
    } catch (falha) {
      avisar(falha.message, "erro");
    } finally {
      setEnviando("");
    }
  }

  async function remover(slot) {
    try {
      await api(`/api/gestor/site/imagens/${slot}`, { metodo: "DELETE" });
      avisar("Imagem removida. O site volta à ilustração padrão.");
      carregar();
    } catch (falha) {
      avisar(falha.message, "erro");
    }
  }

  const escuro = (slot) => ["logo-menu", "logo-rodape", "logo-entrada", "logo-contraste"].includes(slot);

  const cartao = (item) => {
    const ehLogo = item.slot.startsWith("logo");
    return (
      <div key={item.slot} className="cartao-imagem">
        <div
          className="cartao-imagem-previa"
          style={ehLogo ? { background: escuro(item.slot) ? "#0b1830" : "#f4f7fb", display: "grid", placeItems: "center", padding: 16 } : undefined}
        >
          {item.url ? (
            <img src={item.url} alt="" style={ehLogo ? { objectFit: "contain", maxHeight: 90, width: "auto", maxWidth: "100%" } : undefined} />
          ) : ehLogo ? (
            <span style={{ color: escuro(item.slot) ? "#9fb3d1" : "#5b6b84", fontSize: 13 }}>Usa a logo padrão</span>
          ) : (
            <Skyline semente={item.slot} />
          )}
        </div>
        <strong>{item.nome}</strong>
        <span>{item.url ? (ehLogo ? "Logo enviada" : "Foto enviada") : ehLogo ? "Não enviada" : "Ilustração padrão"}</span>
        <div className="tabela-acoes">
          <label className={`botao botao-contorno botao-pequeno${enviando === item.slot ? " desativado" : ""}`}>
            {enviando === item.slot ? "Enviando…" : item.url ? (ehLogo ? "Trocar logo" : "Trocar foto") : ehLogo ? "Enviar logo" : "Enviar foto"}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => enviar(item.slot, e)} />
          </label>
          {item.url && (
            <BotaoConfirmar className="botao botao-fantasma botao-pequeno" confirmar="Remover?" aoConfirmar={() => remover(item.slot)}>
              Remover
            </BotaoConfirmar>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pagina-gestor">
      <div className="pagina-gestor-topo">
        <div>
          <h1>Imagens do site</h1>
          <p>Envie as fotos que aparecem na página inicial. Use fotos largas (horizontais), de boa qualidade.</p>
        </div>
      </div>
      {!lista ? (
        <Carregando />
      ) : (
        <>
          <h2 className="titulo-secao-gestor">Logomarcas</h2>
          <p className="texto-ajuda-gestor">
            Envie PNG com fundo transparente. Cada lugar pode ter a sua logo; se ficar vazio, o site usa a Logo padrão
            (e, em fundo escuro, a Logo de contraste ou a padrão em branco).
          </p>
          <div className="grade-imagens">{lista.filter((i) => i.slot.startsWith("logo")).map(cartao)}</div>
          <h2 className="titulo-secao-gestor">Fotos do site</h2>
          <div className="grade-imagens">{lista.filter((i) => !i.slot.startsWith("logo")).map(cartao)}</div>
        </>
      )}
    </div>
  );
}
