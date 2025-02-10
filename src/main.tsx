import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import shadowStyles from "./shadow-styles.css?inline";
import { LogseqReadyProvider } from "./components/LogseqReadyProvider";

import { logseq as PL } from "../package.json";
import { observeElement } from "./utils";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

const UI_ROOT_ID = "seqretary-root";

function render() {
  const rootElem = document.createElement("div");
  rootElem.id = UI_ROOT_ID;

  // Create shadow root
  const shadow = rootElem.attachShadow({ mode: "open" });

  // Create style element and inject the compiled Tailwind styles
  const styleSheet = document.createElement("style");
  styleSheet.textContent = shadowStyles;
  shadow.appendChild(styleSheet);

  // Create container for React app with full width
  const container = document.createElement("div");
  container.className = "w-full";
  shadow.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <LogseqReadyProvider>
        <App />
      </LogseqReadyProvider>
    </React.StrictMode>,
  );

  return rootElem;
}
async function main() {
  // Initialize Logseq first
  await logseq.ready();

  const uiRoot = render();
  const rightSidebarObserver = observeElement("#right-sidebar-container")
    .onAppear((el) => {
      console.log("appeared", el);
      const sidebarItemList = el.querySelector(".sidebar-item-list");
      const existing = sidebarItemList?.querySelector(`#${UI_ROOT_ID}`);

      // Remove existing element if it exists (for hot reload)
      if (existing) {
        existing.remove();
      }

      // Add the new element
      if (sidebarItemList) {
        sidebarItemList.appendChild(uiRoot);
      }
    })
    .onDisappear(() => console.log("disappeared"));
  console.info(`#${pluginId}: MAIN`);
}

// Start the plugin
main().catch(console.error);
