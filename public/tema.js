// Aplica o tema salvo antes de a página pintar (evita piscar). Padrão: claro.
try {
  var t = localStorage.getItem("f7-tema");
  if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
  if (localStorage.getItem("f7-sem-animacao") === "1") document.documentElement.classList.add("sem-animacao");
} catch (e) {}
