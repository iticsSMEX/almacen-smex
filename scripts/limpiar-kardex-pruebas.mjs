/**
 * Anula movimientos "prueba script" y corrige stock del cortador 1/2 (id 55).
 * Uso: node scripts/limpiar-kardex-pruebas.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "..", ".env"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.VITE_APP_SUPABASE_URL;
const key = env.VITE_APP_SUPABASE_ANON_KEY;
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const PRODUCTO_ID = 55;
const STOCK_ESPERADO = 2;

function esPrueba(detalle) {
  return /prueba\s*script/i.test(String(detalle ?? ""));
}

async function main() {
  const kardexRes = await fetch(
    `${url}/rest/v1/kardex?id_producto=eq.${PRODUCTO_ID}&select=id,detalle,tipo,cantidad,estado&order=id.asc`,
    { headers },
  );
  const movs = await kardexRes.json();
  console.log("Movimientos producto", PRODUCTO_ID, ":", movs.length);

  for (const fila of movs) {
    if (!esPrueba(fila.detalle)) continue;

    const del = await fetch(`${url}/rest/v1/kardex?id=eq.${fila.id}`, {
      method: "DELETE",
      headers,
    });
    const body = await del.text();
    console.log(`DELETE id=${fila.id}:`, del.status, body || "(ok)");

    if (!del.ok) {
      const patch = await fetch(`${url}/rest/v1/kardex?id=eq.${fila.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          estado: 0,
          detalle: `[ANULADO] ${fila.detalle}`,
        }),
      });
      console.log(
        `PATCH anular id=${fila.id}:`,
        patch.status,
        await patch.text(),
      );
    }
  }

  const prodRes = await fetch(
    `${url}/rest/v1/productos?id=eq.${PRODUCTO_ID}&select=id,descripcion,stock`,
    { headers },
  );
  const [producto] = await prodRes.json();
  console.log("Producto antes:", producto);

  const upd = await fetch(`${url}/rest/v1/productos?id=eq.${PRODUCTO_ID}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ stock: STOCK_ESPERADO }),
  });
  if (!upd.ok) {
    console.error("Error al actualizar stock:", await upd.text());
    process.exit(1);
  }

  const [actualizado] = await upd.json();
  console.log(
    `OK: ${actualizado.descripcion} | stock -> ${actualizado.stock} (esperado ${STOCK_ESPERADO})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
