import { create } from "zustand";
import { MostrarEmpresaPorDefecto } from "../supabase/crudEmpresa";
import { DEFAULT_EMPRESA_ID } from "../config/appConfig";
import { readEmpresaCache, writeEmpresaCache } from "../config/empresaCache";

const cached = readEmpresaCache();

export const useEmpresaStore = create((set) => ({
  dataempresa:
    cached ??
    (DEFAULT_EMPRESA_ID ? { id: DEFAULT_EMPRESA_ID } : {}),
  mostrarEmpresaPorDefecto: async () => {
    const response = await MostrarEmpresaPorDefecto();
    const next =
      response ?? (DEFAULT_EMPRESA_ID ? { id: DEFAULT_EMPRESA_ID } : {});
    writeEmpresaCache(next);
    set({ dataempresa: next });
    return next;
  },
}));
