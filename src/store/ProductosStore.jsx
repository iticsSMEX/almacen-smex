import { create } from "zustand";
import {
  BuscarProductos,
  EditarProductos,
  EliminarProductos,
  InsertarProductos,
  MostrarProductos,
  ReportStockProductosTodos,
  ReportStockXProducto,
  ReportStockBajoMinimo,
  ReportKardexEntradaSalida,
  ReportInventarioValorado,
} from "../supabase/crudProductos";
export const useProductosStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataproductos: [],
  productoItemSelect: [],
  parametros: {},
  mostrarProductos: async (p) => {
    const response = await MostrarProductos(p);
    set({ parametros: p });
    set({ dataproductos: response });
    set({ productoItemSelect: [] });
    return response;
  },
  selectProductos: (p) => {
    set({ productoItemSelect: p });
  },
  insertarProductos: async (p) => {
    await InsertarProductos(p);
    const { mostrarProductos, parametros } = get();
    await mostrarProductos(parametros);
  },
  eliminarProductos: async (p) => {
    await EliminarProductos(p);
    const { mostrarProductos, parametros } = get();
    await mostrarProductos(parametros);
  },

  editarProductos: async (p) => {
    const ok = await EditarProductos(p);
    if (!ok) return false;
    const { mostrarProductos, parametros } = get();
    await mostrarProductos(parametros);
    return true;
  },
  buscarProductos: async (p) => {
    const response = await BuscarProductos(p);
    set({ dataproductos: response });
    return response;
  },
  reportStockProductosTodos: async (p) => {
    const response = await ReportStockProductosTodos(p);
    return response;
  },
  reportStockXproducto: async (p) => {
    const response = await ReportStockXProducto(p);
    return response;
  },
  reportBajoMinimo: async (p) => {
    const response = await ReportStockBajoMinimo(p);
    return response ?? [];
  },
  reportKardexEntradaSalida: async (p) => {
    const response = await ReportKardexEntradaSalida(p);
    return response ?? [];
  },
  reportInventarioValorado: async (p) => {
    const response = await ReportInventarioValorado(p);
    return response;
  },

}));
