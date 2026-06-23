/** Texto normalizado para comparar sin tildes ni mayúsculas. */
export function normalizeProductoSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Puntuación de relevancia: código de barras exacto primero, luego nombre parecido.
 */
export function scoreProductoBusqueda(producto, rawQuery) {
  const q = normalizeProductoSearchText(rawQuery);
  if (!q) return 0;

  const desc = normalizeProductoSearchText(producto.descripcion);
  const bar = normalizeProductoSearchText(producto.codigobarras);
  const ubic = normalizeProductoSearchText(producto.codigointerno);

  if (bar === q) return 1000;
  if (ubic === q) return 980;
  if (desc === q) return 960;
  if (bar.startsWith(q)) return 900;
  if (ubic.startsWith(q)) return 880;
  if (desc.startsWith(q)) return 860;
  if (bar.includes(q)) return 750;
  if (ubic.includes(q)) return 730;
  if (desc.includes(q)) return 700;

  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => desc.includes(w))) return 650;

  let qi = 0;
  for (let i = 0; i < desc.length && qi < q.length; i++) {
    if (desc[i] === q[qi]) qi++;
  }
  if (qi === q.length && q.length >= 3) return 400 + qi;

  return 0;
}

export function rankProductosBusqueda(productos, rawQuery, limit = 40) {
  const q = String(rawQuery ?? "").trim();
  if (!q) return [];
  return (productos ?? [])
    .map((p) => ({ p, score: scoreProductoBusqueda(p, q) }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.p.descripcion ?? "").localeCompare(String(b.p.descripcion ?? ""), "es")
    )
    .slice(0, limit)
    .map((x) => x.p);
}

export function normalizeCodigoBarras(value) {
  return String(value ?? "").trim();
}

/** Coincidencia exacta de código de barras o ubicación interna. */
export function findProductoExactoBarra(productos, rawQuery) {
  const q = normalizeCodigoBarras(rawQuery);
  if (!q) return null;
  return (
    (productos ?? []).find(
      (p) =>
        normalizeCodigoBarras(p.codigobarras) === q ||
        normalizeCodigoBarras(p.codigointerno) === q
    ) ?? null
  );
}

export function pareceCodigoBarras(value) {
  const q = normalizeCodigoBarras(value);
  return q.length >= 8 && /^\d+$/.test(q);
}

export function formatProductoBusquedaSubtitle(producto) {
  const parts = [];
  const bar = String(producto.codigobarras ?? "").trim();
  const ubic = String(producto.codigointerno ?? "").trim();
  if (bar) parts.push(`Cód. barras: ${bar}`);
  if (ubic) parts.push(`Ubicación: ${ubic}`);
  if (producto.stock != null) parts.push(`Stock: ${producto.stock}`);
  return parts.join(" · ");
}
