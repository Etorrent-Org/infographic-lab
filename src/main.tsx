import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import "./retouch-history.css";
import "./block-manager.css";
import "./global-editor.css";
import "./project-export.css";
import "./studio-controls.css";
import "./v1.css";
import "./augmented.css";
import "./ui-audit.css";
import "./ui-audit-actions.css";
import "./ui-audit-dark-preview.css";
import "./ui-audit-dark-marketing.css";
import "./ui-audit-export-bar.css";
import "./ui-audit-selection.css";
import "./ui-audit-files.css";
import "./ui-audit-mobile.css";
import "./ui-audit-colors.css";
import "./ui-audit-labels";
import "./ui-audit-active-tab";
import "./ui-audit-focus.css";
import "./ui-audit-scroll.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
