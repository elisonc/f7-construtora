// Gráficos do dashboard em SVG puro. Uma série só (sem legenda: o título diz o que é).
// Cor da série validada para o fundo escuro: #3d9bd6. Textos usam as cores de texto.
import { useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP, reduzirMovimento } from "../lib/gsap.js";
import { diaCurto, numero } from "../lib/formato.js";

function tetoLimpo(valor) {
  if (valor <= 4) return 4;
  const potencia = 10 ** Math.floor(Math.log10(valor));
  const n = valor / potencia;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * potencia;
}

const compacto = (n) => (n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : String(n));

// Topo arredondado (4px) e base reta, crescendo da linha zero.
function caminhoColuna(x, y, largura, altura) {
  const r = Math.min(4, largura / 2, altura);
  return `M${x},${y + altura} V${y + r} Q${x},${y} ${x + r},${y} H${x + largura - r} Q${x + largura},${y} ${x + largura},${y + r} V${y + altura} Z`;
}

export function GraficoAcessos({ serie }) {
  const caixa = useRef(null);
  const [largura, setLargura] = useState(640);
  const [foco, setFoco] = useState(null);

  useLayoutEffect(() => {
    const observar = new ResizeObserver(([entrada]) => setLargura(Math.max(280, entrada.contentRect.width)));
    observar.observe(caixa.current);
    return () => observar.disconnect();
  }, []);

  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap.from(".coluna", {
        scaleY: 0,
        transformOrigin: "50% 100%",
        stagger: { amount: 0.5 },
        duration: 0.8,
        ease: "power3.out",
      });
    },
    { scope: caixa, dependencies: [serie], revertOnUpdate: true }
  );

  const altura = 240;
  const m = { topo: 14, direita: 8, base: 26, esquerda: 40 };
  const areaL = largura - m.esquerda - m.direita;
  const areaA = altura - m.topo - m.base;
  const maximo = Math.max(...serie.map((d) => d.visitas), 0);
  const teto = tetoLimpo(maximo);
  const divisoes = teto % 4 === 0 ? 4 : 5;
  const marcas = Array.from({ length: divisoes + 1 }, (_, i) => (teto / divisoes) * i);
  const slot = areaL / serie.length;
  const larguraBarra = Math.min(24, Math.max(2, slot - 2));
  const cadaRotulo = Math.ceil(serie.length / Math.max(2, Math.floor(areaL / 64)));
  const y = (v) => m.topo + areaA - (v / teto) * areaA;
  const ponto = foco !== null ? serie[foco] : null;
  const total = serie.reduce((s, d) => s + d.visitas, 0);

  return (
    <div className="grafico" ref={caixa}>
      <svg
        width={largura}
        height={altura}
        role="img"
        aria-label={`Acessos por dia: ${numero(total)} no período, máximo de ${numero(maximo)} em um dia.`}
        onMouseLeave={() => setFoco(null)}
      >
        {marcas.map((v) => (
          <g key={v}>
            <line className="grade" x1={m.esquerda} x2={largura - m.direita} y1={y(v)} y2={y(v)} />
            <text className="eixo" x={m.esquerda - 8} y={y(v)} textAnchor="end" dominantBaseline="middle">
              {compacto(v)}
            </text>
          </g>
        ))}
        {serie.map((d, i) => {
          const x = m.esquerda + i * slot + (slot - larguraBarra) / 2;
          const h = (d.visitas / teto) * areaA;
          return (
            <g key={d.dia}>
              {h > 0 && (
                <path
                  className={`coluna${foco === i ? " ativa" : ""}`}
                  d={caminhoColuna(x, y(d.visitas), larguraBarra, h)}
                />
              )}
              {i % cadaRotulo === 0 && (
                <text className="eixo" x={x + larguraBarra / 2} y={altura - 6} textAnchor="middle">
                  {diaCurto(d.dia)}
                </text>
              )}
              {/* Área de toque maior que a coluna. */}
              <rect
                className="alvo"
                x={m.esquerda + i * slot}
                y={m.topo}
                width={slot}
                height={areaA}
                tabIndex={0}
                aria-label={`${diaCurto(d.dia)}: ${d.visitas} acessos`}
                onMouseEnter={() => setFoco(i)}
                onFocus={() => setFoco(i)}
                onBlur={() => setFoco(null)}
              />
            </g>
          );
        })}
      </svg>
      {ponto && (
        <div
          className="dica"
          style={{
            left: Math.min(Math.max(m.esquerda + foco * slot + slot / 2, 70), largura - 70),
            top: Math.max(y(ponto.visitas) - 12, 8),
          }}
        >
          <strong>{diaCurto(ponto.dia)}</strong>
          <span>
            {numero(ponto.visitas)} acesso{ponto.visitas === 1 ? "" : "s"}
          </span>
          <span>
            {numero(ponto.visitantes)} visitante{ponto.visitantes === 1 ? "" : "s"}
          </span>
        </div>
      )}
      <details className="tabela-dados">
        <summary>Ver em tabela</summary>
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Acessos</th>
              <th>Visitantes</th>
            </tr>
          </thead>
          <tbody>
            {serie.map((d) => (
              <tr key={d.dia}>
                <td>{diaCurto(d.dia)}</td>
                <td>{d.visitas}</td>
                <td>{d.visitantes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

// Barras horizontais com o valor na ponta (páginas, origens, dispositivos).
export function BarrasHorizontais({ itens, vazio = "Sem dados no período." }) {
  const ref = useRef(null);
  const maximo = Math.max(...itens.map((i) => i.valor), 1);
  const total = itens.reduce((s, i) => s + i.valor, 0);

  useGSAP(
    () => {
      if (reduzirMovimento()) return;
      gsap.from(".barra-h-preenchida", { scaleX: 0, transformOrigin: "0 50%", stagger: 0.06, duration: 0.9 });
    },
    { scope: ref, dependencies: [JSON.stringify(itens)], revertOnUpdate: true }
  );

  if (!itens.length) return <p className="vazio-pequeno">{vazio}</p>;

  return (
    <ul ref={ref} className="barras-h">
      {itens.map((item) => (
        <li key={item.rotulo} title={`${item.rotulo}: ${numero(item.valor)}`}>
          <div className="barra-h-topo">
            <span className="barra-h-rotulo">{item.rotulo}</span>
            <span className="barra-h-valor">
              {numero(item.valor)}
              {item.mostrarPercentual && total > 0 && <small> · {Math.round((item.valor / total) * 100)}%</small>}
            </span>
          </div>
          <div className="barra-h-trilho">
            <span className="barra-h-preenchida" style={{ width: `${(item.valor / maximo) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
