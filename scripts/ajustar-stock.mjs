/**
 * Ajuste manual de stock sin kardex.
 * Uso:
 *   node scripts/ajustar-stock.mjs --id 55 --delta 1
 *   node scripts/ajustar-stock.mjs --nombre "1/2" --stock 2
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
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

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const idArg = arg("--id");
  const nombreArg = arg("--nombre");
  const stockArg = arg("--stock");
  const deltaArg = arg("--delta");

  let producto = null;

  if (idArg) {
    const res = await fetch(
      `${url}/rest/v1/productos?id=eq.${idArg}&select=id,descripcion,stock`,
      { headers },
    );
    const rows = await res.json();
    producto = rows[0];
  } else if (nombreArg) {
    const res = await fetch(
      `${url}/rest/v1/productos?descripcion=ilike.*${encodeURIComponent(nombreArg)}*&select=id,descripcion,stock`,
      { headers },
    );
    const rows = await res.json();
    producto = rows.find((p) =>
      String(p.descripcion).toUpperCase().includes("1/2"),
    ) ?? rows[0];
  }

  if (!producto) {
    console.error("Producto no encontrado.");
    process.exit(1);
  }

  const stockActual = Number(producto.stock) || 0;
  const stockNuevo =
    stockArg != null
      ? Number(stockArg)
      : deltaArg != null
        ? stockActual + Number(deltaArg)
        : null;

  if (!Number.isFinite(stockNuevo)) {
    console.error("Indique --stock o --delta.");
    process.exit(1);
  }

  const upd = await fetch(`${url}/rest/v1/productos?id=eq.${producto.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ stock: stockNuevo }),
  });

  if (!upd.ok) {
    console.error("Error:", await upd.text());
    process.exit(1);
  }

  const [actualizado] = await upd.json();
  console.log(
    `OK: ${actualizado.descripcion} | ${stockActual} -> ${actualizado.stock}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
