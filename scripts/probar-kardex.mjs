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

async function main() {
  const sample = await fetch(
    `${url}/rest/v1/kardex?select=*&order=id.desc&limit=1`,
    { headers },
  );
  console.log("ULTIMO KARDEX:", JSON.stringify(await sample.json(), null, 2));

  const usuarios = await fetch(`${url}/rest/v1/usuarios?select=id&limit=3`, {
    headers,
  });
  console.log("USUARIOS:", await usuarios.json());

  const producto = await fetch(
    `${url}/rest/v1/productos?id=eq.55&select=id,stock,descripcion`,
    { headers },
  );
  const [p] = await producto.json();
  console.log("PRODUCTO:", p);

  const payloads = [
    {
      label: "minimo",
      body: {
        fecha: new Date().toISOString(),
        tipo: "salida",
        cantidad: 1,
        detalle: "prueba script",
        id_empresa: 1,
        id_producto: 55,
        id_usuario: 1,
      },
    },
    {
      label: "con stock",
      body: {
        fecha: new Date().toISOString(),
        tipo: "salida",
        cantidad: 1,
        detalle: "prueba script stock",
        id_empresa: 1,
        id_producto: 55,
        id_usuario: 1,
        stock: Number(p.stock) - 1,
      },
    },
  ];

  for (const { label, body } of payloads) {
    const res = await fetch(`${url}/rest/v1/kardex`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log(`\nINSERT ${label} status=${res.status}`);
    console.log(text);
    if (res.ok) {
      const row = JSON.parse(text)[0];
      await fetch(`${url}/rest/v1/kardex?id=eq.${row.id}`, {
        method: "DELETE",
        headers,
      });
      console.log("(fila de prueba eliminada)");
      break;
    }
  }
}

main().catch(console.error);
