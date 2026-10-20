// Cole no console (ou use javascript_tool): lista textos com contraste ruim na página aberta.
(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mix = (top, base) => ({
    r: top.r * top.a + base.r * (1 - top.a),
    g: top.g * top.a + base.g * (1 - top.a),
    b: top.b * top.a + base.b * (1 - top.a),
    a: 1,
  });
  const fundoDe = (el) => {
    const camadas = [];
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== "none") return { incerto: true };
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        camadas.push(c);
        if (c.a >= 1) break;
      }
      n = n.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = camadas.length - 1; i >= 0; i--) base = mix(camadas[i], base);
    return base;
  };
  const ruins = [];
  const vistos = new Set();
  for (const el of document.querySelectorAll("body *")) {
    if (!el.childNodes.length) continue;
    const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!temTexto) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.3) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const fundo = fundoDe(el);
    if (fundo.incerto) continue;
    let cor = parse(cs.color);
    if (!cor) continue;
    cor = mix({ ...cor, a: cor.a * Number(cs.opacity) }, fundo);
    const L1 = lum(cor), L2 = lum(fundo);
    const razao = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const grande = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.6 && Number(cs.fontWeight) >= 700);
    const minimo = grande ? 3 : 4.5;
    if (razao < minimo) {
      const chave = `${el.className}|${el.textContent.trim().slice(0, 20)}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      ruins.push({
        el: (el.tagName.toLowerCase() + "." + String(el.className).split(" ").slice(0, 2).join(".")).slice(0, 50),
        texto: el.textContent.trim().slice(0, 28),
        razao: +razao.toFixed(2),
        cor: cs.color,
        fundo: `rgb(${Math.round(fundo.r)},${Math.round(fundo.g)},${Math.round(fundo.b)})`,
      });
    }
  }
  return ruins;
})();
