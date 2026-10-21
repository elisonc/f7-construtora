import { useImagens } from "../lib/imagens.jsx";

// Caminho da logo padrão no public/ (sempre disponível)
const LOGO_PADRAO = "/logo-f7.png";

/* SVG da marca F7 — fallback quando não há PNG disponível. */
export function LogoSVG({ className = "" }) {
  return (
    <svg
      className={`logo-svg ${className}`}
      viewBox="0 0 320 72"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Badge navy */}
      <rect x="0" y="0" width="72" height="72" rx="13" fill="#1B2F50" />

      {/* F — barra vertical */}
      <rect x="13" y="12" width="10" height="48" fill="white" />
      {/* F — barra do topo */}
      <rect x="13" y="12" width="36" height="10" fill="white" />
      {/* F — barra do meio */}
      <rect x="13" y="32" width="28" height="9" fill="white" />

      {/* 7 — barra do topo */}
      <rect x="35" y="12" width="24" height="10" fill="white" />
      {/* 7 — diagonal */}
      <polygon points="59,12 59,22 47,60 37,60 49,22 49,12" fill="white" />

      {/* Texto direito — usa currentColor para adaptar ao contexto */}
      <text
        x="84"
        y="33"
        fontFamily="'Montserrat','Segoe UI','Arial',sans-serif"
        fontSize="19"
        fontWeight="700"
        letterSpacing="2"
        fill="currentColor"
      >
        ENGENHARIA
      </text>
      <text
        x="84"
        y="60"
        fontFamily="'Montserrat','Segoe UI','Arial',sans-serif"
        fontSize="19"
        fontWeight="700"
        letterSpacing="2"
        fill="currentColor"
      >
        ESTRATÉGICA
      </text>
    </svg>
  );
}

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

export default function Logo({ className = "", contraste = false }) {
  const imagens = useImagens();

  // API já retorna a URL completa; fallback = public/logo-f7.png
  const slot = contraste ? "logo-contraste" : "logo";
  const src = imagens?.[slot] || imagens?.logo || LOGO_PADRAO;

  return (
    <span className={`logo logo-personalizada${contraste ? " logo-contraste" : ""} ${className}`}>
      <img src={src} alt="F7 Engenharia Estratégica" className="logo-img" />
    </span>
  );
}
