import { useState } from "react";

const atual = () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

export default function TemaBotao({ className = "" }) {
  const [tema, setTema] = useState(atual);

  function alternar() {
    const novo = tema === "light" ? "dark" : "light";
    const raiz = document.documentElement;
    raiz.classList.add("tema-muda");
    raiz.setAttribute("data-theme", novo);
    try {
      localStorage.setItem("f7-tema", novo);
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
    setTema(novo);
    setTimeout(() => raiz.classList.remove("tema-muda"), 450);
  }

  const proximo = tema === "light" ? "Bordô" : "Azul";
  return (
    <button type="button" className={`tema-botao ${className}`} onClick={alternar} aria-label={`Mudar para o tema ${proximo}`} title={`Tema ${proximo}`}>
      <svg className="lua" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
      </svg>
      <svg className="sol" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
