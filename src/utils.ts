import { LSPluginUserEvents } from "@logseq/libs/dist/LSPlugin.user";
import React from "react";

let _visible = logseq.isMainUIVisible;

function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  handler: (...args: any) => void,
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

export const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent("ui:visible:changed", ({ visible }) => {
    _visible = visible;
    onChange();
  });

export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

type ElementObserver = {
  onAppear: (callback: (el: HTMLElement) => void) => ElementObserver;
  onDisappear: (callback: () => void) => ElementObserver;
  disconnect: () => void;
};

export function observeElement(id: string): ElementObserver {
  let element: HTMLElement | null = parent.document.querySelector(id);
  let appearCallback: ((el: HTMLElement) => void) | null = null;
  let disappearCallback: (() => void) | null = null;

  const notify = () => {
    const newElement = parent.document.querySelector(id) as HTMLElement | null;
    if (newElement && newElement !== element) {
      element = newElement;
      appearCallback?.(newElement);
    } else if (!newElement && element) {
      element = null;
      disappearCallback?.();
    }
  };

  const observer = new MutationObserver(notify);
  observer.observe(parent.document.body, { childList: true, subtree: true });

  // Initial check in case the element already exists
  notify();

  return {
    onAppear(callback) {
      appearCallback = callback;
      return this;
    },
    onDisappear(callback) {
      disappearCallback = callback;
      return this;
    },
    disconnect() {
      observer.disconnect();
    },
  };
}
