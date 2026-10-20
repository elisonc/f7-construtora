import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/inter";
import "./styles/base.css";
import "./styles/site.css";
import "./styles/painel.css";
import "./styles/home.css";
import "./styles/menu.css";
import "./styles/site2.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
