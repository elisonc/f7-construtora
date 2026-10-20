# Define as duas variações de cor do site (bloco de variáveis do base.css):
#   tema claro  = AZUL marinho (a paleta original aprovada)
#   tema escuro = fundo AZUL com letras brancas
# As "ilhas" (topo, rodapé, faixas) ficam sempre escuras, na cor da paleta ativa.
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "styles"))

base = open("base.css", encoding="utf-8").read()
fim = base.index(".botao-primario.sobre-escuro")
resto = base[fim:]

blocos = '''/* Duas variações de cor. Tema escuro = fundo azul com letras brancas. Tema claro = fundo branco com letras azuis (o inverso). */
:root,
:root[data-theme="dark"] {
  color-scheme: dark;
  --preto: #050f1f;
  --fundo: #071428;
  --fundo-2: #0a1c36;
  --superficie: #0d2342;
  --superficie-2: #122c52;
  --borda: rgba(120, 170, 230, 0.13);
  --borda-forte: rgba(120, 170, 230, 0.3);
  --texto: #f1f5fb;
  --texto-suave: #a8b8cf;
  --texto-fraco: #8a9db8;
  --azul-claro: #9cc4f0;
  --azul: #4c8fd6;
  --azul-medio: #1f5fa8;
  --azul-profundo: #123e73;
  --sucesso: #7fc8a0;
  --alerta: #e8b45c;
  --perigo: #e57373;
  --gradiente-marca: linear-gradient(180deg, #ffffff 10%, #9cc4f0 55%, #5a9cc5 100%);
  --raio: 18px;
  --raio-sm: 11px;
  --fonte-titulo: "Montserrat Variable", system-ui, sans-serif;
  --fonte-texto: "Inter Variable", system-ui, sans-serif;
  --sombra: 0 30px 70px -30px rgba(0, 0, 0, 0.75);
  --largura: 1200px;
  --curva: cubic-bezier(0.2, 0.7, 0.2, 1);
  --leve: rgba(255, 255, 255, 0.05);
  --vidro: rgba(5, 15, 31, 0.8);
  --vidro-forte: rgba(5, 15, 31, 0.97);
  --btn-bg: linear-gradient(180deg, #ffffff, #cfe2fa);
  --btn-texto: #06142b;
  --marca-1: #ffffff;
  --marca-2: #cfe2fa;
  --marca-3: #4c8fd6;
  --marca-4: #9fb0c7;
  --acento-rgb: 76, 143, 214;
  --borda-rgb: 120, 170, 230;
  --ilha-rgb: 5, 15, 31;
  --ilha-a: #0a1a33;
  --ilha-b: #0e2a52;
  --ilha-c: #0b2040;
}

:root[data-theme="light"] {
  color-scheme: light;
  --fundo: #f4f7fb;
  --fundo-2: #e9eff7;
  --superficie: #ffffff;
  --superficie-2: #eef3f9;
  --borda: rgba(20, 50, 100, 0.13);
  --borda-forte: rgba(20, 50, 100, 0.28);
  --texto: #0a1b33;
  --texto-suave: #43587a;
  --texto-fraco: #51668a;
  --azul-claro: #123e73;
  --azul: #1f5fa8;
  --azul-medio: #3f84ab;
  --azul-profundo: #0a2342;
  --gradiente-marca: linear-gradient(180deg, #0a1b33 0%, #123e73 100%);
  --sombra: 0 24px 50px -28px rgba(10, 35, 80, 0.35);
  --leve: rgba(10, 40, 60, 0.06);
  --vidro: rgba(246, 249, 251, 0.86);
  --vidro-forte: rgba(246, 249, 251, 0.98);
  --btn-bg: linear-gradient(180deg, #1c4f8f, #0a2342);
  --btn-texto: #ffffff;
  --marca-1: #0a2342;
  --marca-2: #123e73;
  --marca-3: #1f5fa8;
  --marca-4: #7d8da3;
  --acento-rgb: 31, 95, 168;
  --borda-rgb: 20, 50, 100;
  --ilha-rgb: 5, 15, 31;
  --ilha-a: #0a1a33;
  --ilha-b: #0e2a52;
  --ilha-c: #0b2040;
}

:root[data-theme="light"] .hero,
:root[data-theme="light"] .rodape,
:root[data-theme="light"] .intro,
:root[data-theme="light"] .entrar-visual,
:root[data-theme="light"] .emp-banner,
:root[data-theme="light"] .topo:not(.rolado),
:root[data-theme="light"] .secao-escura,
:root[data-theme="light"] .cta-faixa,
:root[data-theme="light"] .conta-resumo,
:root[data-theme="light"] .doc-cartao {
  color-scheme: dark;
  --preto: #050f1f;
  --fundo: #071428;
  --fundo-2: #0a1c36;
  --superficie: #0d2342;
  --superficie-2: #122c52;
  --borda: rgba(120, 170, 230, 0.13);
  --borda-forte: rgba(120, 170, 230, 0.3);
  --texto: #f1f5fb;
  --texto-suave: #a8b8cf;
  --texto-fraco: #8a9db8;
  --azul-claro: #9cc4f0;
  --azul: #4c8fd6;
  --gradiente-marca: linear-gradient(180deg, #ffffff 10%, #9cc4f0 55%, #5a9cc5 100%);
  --leve: rgba(255, 255, 255, 0.05);
  --vidro: rgba(5, 15, 31, 0.78);
  --vidro-forte: rgba(5, 15, 31, 0.97);
  --btn-bg: linear-gradient(180deg, #ffffff, #cfe2fa);
  --btn-texto: #06142b;
  --marca-1: #ffffff;
  --marca-2: #cfe2fa;
  --marca-3: #4c8fd6;
  --marca-4: #9fb0c7;
  --acento-rgb: 76, 143, 214;
  --borda-rgb: 120, 170, 230;
  --ilha-rgb: 5, 15, 31;
  color: var(--texto);
}

'''
open("base.css", "w", encoding="utf-8").write(blocos + resto)
print("paletas ok")
