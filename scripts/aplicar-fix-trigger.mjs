/**
 * Aplica fix-kardex-salida-cero.sql en Supabase.
 * Requiere contraseña de base de datos (Settings → Database).
 *
 * Uso:
 *   set SUPABASE_DB_PASSWORD=tu_contraseña
 *   node scripts/aplicar-fix-trigger.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

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

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error(
    "Defina SUPABASE_DB_PASSWORD (contraseña en Supabase → Settings → Database).",
  );
  console.error(
    "O copie y ejecute manualmente: supabase/sql/fix-kardex-salida-cero.sql",
  );
  process.exit(1);
}

const ref = env.VITE_APP_SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

const sql = readFileSync(
  resolve(__dirname, "..", "supabase", "sql", "fix-kardex-salida-cero.sql"),
  "utf8",
);

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("OK: trigger de kardex actualizado. Ya puede sacar hasta dejar stock en 0.");
} catch (e) {
  console.error("Error al aplicar SQL:", e.message);
  console.error("Ejecute el archivo manualmente en Supabase → SQL Editor.");
  process.exit(1);
} finally {
  await client.end();
}
