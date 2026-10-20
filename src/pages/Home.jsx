import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Hero from "./home/Hero.jsx";
import QuemSomos from "./home/QuemSomos.jsx";
import Construcoes from "./home/Construcoes.jsx";
import DiferenciaisHome from "./home/DiferenciaisHome.jsx";
import Regioes from "./home/Regioes.jsx";
import AreaCliente from "./home/AreaCliente.jsx";
import Chamada from "./home/Chamada.jsx";
import Contato from "./home/Contato.jsx";

export default function Home() {
  const [obras, setObras] = useState(null);

  useEffect(() => {
    document.title = "F7 Engenharia Estratégica — Construímos com quem constrói";
    api("/api/empreendimentos")
      .then(setObras)
      .catch(() => setObras([]));
  }, []);

  return (
    <>
      <Hero />
      <QuemSomos />
      <Construcoes lista={obras} />
      <DiferenciaisHome />
      <Regioes />
      <AreaCliente />
      <Chamada />
      <Contato opcoes={(obras ?? []).filter((o) => o.status === "em_obras").map((o) => o.nome)} />
    </>
  );
}
