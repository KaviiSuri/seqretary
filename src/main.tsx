import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import shadowStyles from "./shadow-styles.css?inline";

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
      <App />
    </React.StrictMode>,
  );

  return rootElem;
}

function main() {
  const uiRoot = render();
  const rightSidebarObserver = observeElement("#right-sidebar-container")
    .onAppear((el) => {
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
  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "seqretary-open";

  logseq.provideStyle(css`
    .${openIconName} {
      opacity: 0.55;
      font-size: 20px;
      margin-top: 4px;
    }

    .${openIconName}:hover {
      opacity: 0.9;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
    <a data-on-click="show">
        <div class="${openIconName}">⚙️</div>
    </a>    
`,
  });

  return () => {
    rightSidebarObserver.disconnect();
  };
}

logseq.ready(main).catch(console.error);
