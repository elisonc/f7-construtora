import { useImagens } from "../lib/imagens.jsx";

// Marca da F7 Engenharia Estratégica: só tipografia. As letras "F" e "7" se encontram na barra
// superior (como uma ligatura) e o nome completo vai pequeno, ao lado, em duas linhas.
// As cores vêm de variáveis (--marca-*), então mudam junto com o tema Vinho / Verde Musgo.
// As classes f7-barra (cada letra) são usadas nas animações de abertura.
export function MarcaF7({ className = "", titulo }) {
  return (
    <span
      className={`marca-f7 ${className}`}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <i className="f7-barra">F</i>
      <i className="f7-barra">7</i>
    </span>
  );
}

export default function Logo({ className = "" }) {
  const imagens = useImagens();
  const logoUrl = imagens?.logo;

  if (logoUrl) {
    return (
      <span className={`logo logo-personalizada ${className}`}>
        <img src={logoUrl} alt="F7 Engenharia Estratégica" className="logo-img" />
      </span>
    );
  }

  return (
    <span className={`logo ${className}`}>
      <MarcaF7 />
      <span className="logo-sub">
        <span>Engenharia</span>
        <span>Estratégica</span>
      </span>
    </span>
  );
}
