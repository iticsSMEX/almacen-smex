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

const res = await fetch(`${env.VITE_APP_SUPABASE_URL}/rest/v1/`, {
  headers: {
    apikey: env.VITE_APP_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.VITE_APP_SUPABASE_ANON_KEY}`,
    Accept: "application/openapi+json",
  },
});
const schema = await res.json();
const paths = Object.keys(schema.paths ?? {}).filter((p) => p.includes("/rpc/"));
console.log(paths.map((p) => p.replace("/rpc/", "")).sort().join("\n"));
