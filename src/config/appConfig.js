const parseId = (value) => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Empresa usada en toda la app (sin login). Definir en .env o se toma la primera de la BD. */
export const DEFAULT_EMPRESA_ID = parseId(
  import.meta.env.VITE_DEFAULT_EMPRESA_ID
);

/** Solo si la columna id_usuario en kardex es obligatoria en Supabase. */
export const DEFAULT_USUARIO_ID = parseId(
  import.meta.env.VITE_DEFAULT_USUARIO_ID,
);

/** Tabla de empresa en Supabase (evita probar varias tablas en serie). */
export const EMPRESA_TABLE =
  import.meta.env.VITE_EMPRESA_TABLE || "empresa";
