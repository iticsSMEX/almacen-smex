/**
 * Diagnóstico stock vs stock_minimo vs kardex.
 * Uso: node scripts/diagnostico-stock.mjs --nombre "5/8"
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
const headers = { apikey: key, Authorization: `Bearer ${key}` };

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const q = arg("--nombre") ?? arg("--id");
  if (!q) {
    console.error("Uso: --nombre \"5/8\" o --id 123");
    process.exit(1);
  }

  const isId = /^\d+$/.test(q);
  const prodUrl = isId
    ? `${url}/rest/v1/productos?id=eq.${q}&select=*`
    : `${url}/rest/v1/productos?descripcion=ilike.*${encodeURIComponent(q)}*&select=*`;

  const prodRes = await fetch(prodUrl, { headers });
  const productos = await prodRes.json();
  const producto = isId
    ? productos[0]
    : productos.find((p) =>
        String(p.descripcion).toLowerCase().includes(q.toLowerCase()),
      ) ?? productos[0];

  if (!producto) {
    console.error("Producto no encontrado");
    process.exit(1);
  }

  console.log("=== PRODUCTO (tabla) ===");
  console.log({
    id: producto.id,
    descripcion: producto.descripcion,
    stock: producto.stock,
    stock_minimo: producto.stock_minimo,
  });

  const rpcRes = await fetch(`${url}/rest/v1/rpc/mostrarproductos`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ _id_empresa: producto.id_empresa ?? 1 }),
  });
  const rpcList = await rpcRes.json();
  const rpcRow = rpcList?.find((p) => p.id === producto.id);
  console.log("\n=== RPC mostrarproductos ===");
  console.log(
    rpcRow
      ? { stock: rpcRow.stock, stock_minimo: rpcRow.stock_minimo }
      : "no encontrado en RPC",
  );

  const kRes = await fetch(
    `${url}/rest/v1/kardex?id_producto=eq.${producto.id}&estado=eq.1&select=id,tipo,cantidad,detalle&order=id.asc`,
    { headers },
  );
  const movs = await kRes.json();
  let neto = 0;
  for (const m of movs) {
    const q = Number(m.cantidad) || 0;
    if (m.tipo === "entrada") neto += q;
    else if (m.tipo === "salida") neto -= q;
  }
  console.log("\n=== KARDEX activo ===");
  console.log(movs);
  console.log("Neto entradas-salidas (sin stock inicial):", neto);

  const stock = Number(producto.stock) || 0;
  const min = Number(producto.stock_minimo) || 0;
  const maxSalida = Math.max(0, stock - min);
  console.log("\n=== REGLA TRIGGER (estimada) ===");
  console.log(
    `Stock tabla: ${stock}, mínimo: ${min} → máximo salida permitida: ${maxSalida}`,
  );
}

main().catch(console.error);
