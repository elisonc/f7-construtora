import { useImagens } from "../lib/imagens.jsx";
import Skyline from "./Skyline.jsx";

// Foto do site: usa a imagem enviada no painel; sem imagem, mostra a ilustração da marca.
export default function Foto({ slot, semente = slot, alt = "", className = "", reveal = true }) {
  const imagens = useImagens();
  const url = imagens[slot];
  return (
    <div className={`foto-caixa ${className}`} {...(reveal ? { "data-foto": "" } : {})}>
      {url ? <img src={url} alt={alt} loading="lazy" /> : <Skyline semente={semente} />}
    </div>
  );
}
