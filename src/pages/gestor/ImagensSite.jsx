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
      await enviarArquivo(`/api/gestor/site/imagens/${slot}`, await reduzirImagem(arquivo, 2400));
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
        <div className="grade-imagens">
          {lista.map((item) => (
            <div key={item.slot} className="cartao-imagem">
              <div className="cartao-imagem-previa">{item.url ? <img src={item.url} alt="" /> : <Skyline semente={item.slot} />}</div>
              <strong>{item.nome}</strong>
              <span>{item.url ? "Foto enviada" : "Ilustração padrão"}</span>
              <div className="tabela-acoes">
                <label className={`botao botao-contorno botao-pequeno${enviando === item.slot ? " desativado" : ""}`}>
                  {enviando === item.slot ? "Enviando…" : item.url ? "Trocar foto" : "Enviar foto"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => enviar(item.slot, e)} />
                </label>
                {item.url && (
                  <BotaoConfirmar className="botao botao-fantasma botao-pequeno" confirmar="Remover?" aoConfirmar={() => remover(item.slot)}>
                    Remover
                  </BotaoConfirmar>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
