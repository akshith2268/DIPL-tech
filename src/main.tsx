import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ErrorBoundary } from "./components/system/ErrorBoundary";
import "./styles/index.css";
import "./styles/performance.css";
import "./styles/partners.css";
import "./styles/recognition.css";
import "./styles/admin.css";
import "./styles/header.css";

// React mounts into <div id="root"> from index.html. Do not rename that id
// unless this lookup is updated too.
const root = document.getElementById("root");

if (!root) {
  throw new Error("Application root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    {/* Catches rendering crashes so the website does not become a blank page. */}
    <ErrorBoundary>
      {/* Enables clean URLs like /projects, /kpis, /contact inside React. */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
