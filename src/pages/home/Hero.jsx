import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gsap, useGSAP, reduzirMovimento } from "../../lib/gsap.js";
import { ContextoIntro } from "../../lib/intro.js";
import { useImagens } from "../../lib/imagens.jsx";
import Skyline from "../../components/Skyline.jsx";
import { Magnetico } from "../../components/Efeitos.jsx";

const SLIDES = [
  {
    slot: "hero-1",
    etiqueta: "Engenharia estratégica",
    titulo: "Construímos com quem constrói",
    texto: "Há mais de 20 anos levantando grandes obras para construtoras e incorporadoras que precisam de um parceiro em quem possam confiar.",
  },
  {
    slot: "hero-2",
    etiqueta: "Prazo e qualidade",
    titulo: "Obra boa é obra entregue no prazo, sem surpresas",
    texto: "Planejamos com rigor, executamos com disciplina e comunicamos com transparência, do primeiro dia até a entrega das chaves.",
  },
  {
    slot: "hero-3",
    etiqueta: "Mais de 900 unidades",
    titulo: "938 unidades entregues no Paraná",
    texto: "ISO 9001, PBQP-H A+ e seguro de entrega e pós-obra em todas as obras. Presença em Curitiba, Campo Largo, Pinhais e Guaratuba.",
  },
];

const TEMPO = 8000;

export default function Hero() {
  const ref = useRef(null);
  const pronta = useContext(ContextoIntro);
  const imagens = useImagens();
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const primeiro = useRef(true);

  // Troca de slide: a imagem aparece com zoom lento, o título é "digitado" e o resto sobe com fade.
  useGSAP(
    () => {
      if (!pronta) {
        gsap.set(".hero-conteudo, .hero-controles", { autoAlpha: 0 });
        return;
      }
      const slides = gsap.utils.toArray(".hero-slide");
      const digitado = ref.current.querySelector(".hero-digitado");
      const s = SLIDES[ativo];

      if (reduzirMovimento()) {
        slides.forEach((el, i) => gsap.set(el, { autoAlpha: i === ativo ? 1 : 0 }));
        digitado.textContent = s.titulo;
        gsap.set(".hero-conteudo, .hero-controles", { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline();
      slides.forEach((el, i) => {
        if (i === ativo) return;
        gsap.to(el, { autoAlpha: 0, duration: 1.4, ease: "power2.inOut", overwrite: "auto" });
      });
      tl.fromTo(slides[ativo], { scale: 1.16 }, { scale: 1, duration: 9, ease: "none" }, 0).to(
        slides[ativo],
        { autoAlpha: 1, duration: 1.4, ease: "power2.inOut" },
        0
      );

      gsap.set(".hero-conteudo, .hero-controles", { autoAlpha: 1 });
      digitado.textContent = "";
      const copia = gsap.timeline({ delay: primeiro.current ? 0.3 : 0.5 });
      copia
        .fromTo(".hero-etiqueta", { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.7 })
        .to(digitado, { text: { value: s.titulo, delimiter: "" }, duration: Math.min(3.2, s.titulo.length * 0.032), ease: "none" }, 0.2)
        .fromTo(".hero-texto", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.9 }, "-=0.6")
        .fromTo(".hero-botoes .magnetico", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.8 }, "-=0.6");
      primeiro.current = false;
      return () => {
        tl.kill();
        copia.kill();
      };
    },
    { scope: ref, dependencies: [ativo, pronta], revertOnUpdate: true }
  );

  const proximo = useCallback((passo) => setAtivo((i) => (i + passo + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (pausado || !pronta || reduzirMovimento()) return;
    const id = setTimeout(() => proximo(1), TEMPO);
    return () => clearTimeout(id);
  }, [ativo, pausado, pronta, proximo]);

  // Ao rolar: o conteúdo sobe e some e as imagens descem devagar (parallax).
  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      const rolagem = { trigger: ref.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-conteudo", { yPercent: -18, ease: "none", scrollTrigger: rolagem });
      gsap.to(".hero-slides", { yPercent: 12, ease: "none", scrollTrigger: rolagem });
    },
    { scope: ref }
  );

  const s = SLIDES[ativo];

  return (
    <section
      ref={ref}
      className="hero"
      aria-roledescription="carrossel"
      aria-label="Destaques da F7 Engenharia Estratégica"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="hero-slides" aria-hidden="true">
        {SLIDES.map((sl, i) => (
          <div key={sl.slot} className="hero-slide" style={{ opacity: i === 0 ? 1 : 0 }}>
            {imagens[sl.slot] ? <img src={imagens[sl.slot]} alt="" fetchPriority={i === 0 ? "high" : "low"} /> : <Skyline semente={`hero-${i}-f7`} eager={i === 0} />}
          </div>
        ))}
      </div>
      <div className="hero-veu" aria-hidden="true" />

      <div className="container hero-interno">
        <div className="hero-conteudo">
          <span className="hero-etiqueta">{s.etiqueta}</span>
          <h1 className="hero-titulo" aria-label={s.titulo}>
            <span className="hero-fantasma" aria-hidden="true">
              {s.titulo}
            </span>
            <span className="hero-digitado" aria-hidden="true">
              {s.titulo}
            </span>
          </h1>
          <p className="hero-texto">{s.texto}</p>
          <div className="hero-botoes">
            <Magnetico>
              <Link to="/obras/andamento" className="botao botao-primario">
                Ver construções
              </Link>
            </Magnetico>
            <Magnetico>
              <Link to="/#contato" className="botao botao-contorno">
                Fale com a F7
              </Link>
            </Magnetico>
          </div>
        </div>
      </div>

      <div className="hero-controles">
        <button type="button" onClick={() => proximo(-1)} aria-label="Slide anterior">
          ‹
        </button>
        <div className="hero-pontos">
          {SLIDES.map((sl, i) => (
            <button
              key={sl.slot}
              type="button"
              className={i === ativo ? "ativo" : ""}
              onClick={() => setAtivo(i)}
              aria-label={`Ir para o slide ${i + 1}`}
              aria-current={i === ativo}
            >
              <span key={`${ativo}-${pausado}`} style={i === ativo && !pausado ? { animationDuration: `${TEMPO}ms` } : undefined} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => proximo(1)} aria-label="Próximo slide">
          ›
        </button>
      </div>
    </section>
  );
}
