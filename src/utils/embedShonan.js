export const SHONAN_INVENTORY_READY_MESSAGE = "shonan:inventory-ready";

export function isEmbeddedInShonan() {
  return typeof window !== "undefined" && window.self !== window.top;
}

export function notifyShonanInventoryReady() {
  if (!isEmbeddedInShonan()) return;
  window.parent.postMessage({ type: SHONAN_INVENTORY_READY_MESSAGE }, "*");
}
