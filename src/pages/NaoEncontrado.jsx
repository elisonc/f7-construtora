import { Link } from "react-router";
import { MarcaF7 } from "../components/Logo.jsx";

export default function NaoEncontrado() {
  return (
    <section className="secao nao-encontrado">
      <div className="container estreito centro">
        <MarcaF7 className="nao-encontrado-marca" />
        <h1>Página não encontrada</h1>
        <p>O endereço pode ter mudado ou não existe mais.</p>
        <Link to="/" className="botao botao-primario">
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
