export default function Carregando({ tela = false, texto = "Carregando" }) {
  return (
    <div className={tela ? "carregando carregando-tela" : "carregando"} role="status">
      <span className="carregando-barras" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sr-only">{texto}</span>
    </div>
  );
}
