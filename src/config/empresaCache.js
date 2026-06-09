const CACHE_KEY = "almacen-empresa-v1";

export function readEmpresaCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeEmpresaCache(empresa) {
  if (typeof window === "undefined" || !empresa) return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(empresa));
  } catch {
    /* quota / privado */
  }
}
