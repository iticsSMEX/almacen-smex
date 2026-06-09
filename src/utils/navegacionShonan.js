const SHONAN_APP_URL =
  import.meta.env.VITE_SHONAN_APP_URL || "http://127.0.0.1:5000";

export const SHONAN_CLOSE_INVENTORY_MESSAGE = "shonan:close-inventory";

/** Regresa al panel de Compras en Shonan OS (iframe o pestaña directa). */
export function volverAComprasShonan() {
  if (typeof window !== "undefined" && window.self !== window.top) {
    window.parent.postMessage({ type: SHONAN_CLOSE_INVENTORY_MESSAGE }, "*");
    return;
  }

  const url = new URL(SHONAN_APP_URL);
  url.searchParams.set("module", "purchasing");
  window.location.href = url.toString();
}
