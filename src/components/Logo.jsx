// Marca da F7 Engenharia Estratégica: um "F" e um "7" que dividem a mesma barra superior,
// como uma viga apoiada em um pilar. As cores vêm de variáveis (mudam com o tema claro/escuro).
// As classes f7-barra e f7-arco são usadas nas animações de abertura.
export function MarcaF7({ className = "", titulo }) {
  return (
    <svg
      className={`marca-f7 ${className}`}
      viewBox="0 0 64 66"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <rect className="f7-barra" x="8" y="6" width="13" height="50" style={{ fill: "var(--marca-1)" }} />
      <rect className="f7-barra" x="8" y="6" width="48" height="12" style={{ fill: "var(--marca-1)" }} />
      <rect className="f7-barra" x="21" y="28" width="21" height="9" style={{ fill: "var(--marca-4)" }} />
      <polygon className="f7-barra" points="42,18 56,18 40,56 27,56" style={{ fill: "var(--marca-3)" }} />
      <rect className="f7-arco" x="8" y="61" width="48" height="2.4" rx="1.2" style={{ fill: "var(--marca-4)" }} />
    </svg>
  );
}

export default function Logo({ className = "" }) {
  return (
    <span className={`logo ${className}`}>
      <MarcaF7 />
      <span className="logo-texto">
        <b>F7</b>
        <small>Engenharia Estratégica</small>
      </span>
    </span>
  );
}
