import { supabase } from "../index";
import { DEFAULT_EMPRESA_ID, EMPRESA_TABLE } from "../config/appConfig";

async function fetchEmpresaPorId(id, tabla = EMPRESA_TABLE) {
  const { data, error } = await supabase
    .from(tabla)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!error && data) return data;
  return null;
}

/** Carga la única empresa del inventario (sin login ni asignaciones). */
export const MostrarEmpresaPorDefecto = async () => {
  if (DEFAULT_EMPRESA_ID != null) {
    const porId = await fetchEmpresaPorId(DEFAULT_EMPRESA_ID);
    if (porId) return porId;

    if (EMPRESA_TABLE !== "empresas") {
      const alt = await fetchEmpresaPorId(DEFAULT_EMPRESA_ID, "empresas");
      if (alt) return alt;
    }
  }

  const { data, error } = await supabase
    .from(EMPRESA_TABLE)
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!error && data) return data;
  return null;
};
