import { create } from "zustand";
import {
  BuscarCategorias,
  EditarCategorias,
  EliminarCategorias,
  EliminarCategoriasTodas,
  InsertarCategorias,
  MostrarCategorias,
} from "../index";
export const useCategoriasStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  datacategorias: [],
  categoriaItemSelect: [],
  parametros: {},
  mostrarCategorias: async (p) => {
    const response = await MostrarCategorias(p);
    set({ parametros: p });
    set({ datacategorias: response });
    set({ categoriaItemSelect: response[0] });
    return response;
  },
  selectCategoria: (p) => {
    set({ categoriaItemSelect: p });
  },
  insertarCategorias: async (p) => {
    const ok = await InsertarCategorias(p);
    if (!ok) return false;
    const { mostrarCategorias, parametros } = get();
    await mostrarCategorias(parametros);
    return true;
  },
  eliminarCategoria: async (p) => {
    await EliminarCategorias(p);
    const { mostrarCategorias, parametros } = get();
    await mostrarCategorias(parametros);
  },
  eliminarCategoriasTodas: async (p) => {
    await EliminarCategoriasTodas(p);
    const { mostrarCategorias } = get();
    await mostrarCategorias(p);
  },
  editarCategoria: async (p) => {
    await EditarCategorias(p);
    const { mostrarCategorias, parametros } = get();
    await mostrarCategorias(parametros);
  },
  buscarCategorias: async (p) => {
    const response = await BuscarCategorias(p);
    set({ datacategorias: response });
  },
}));
