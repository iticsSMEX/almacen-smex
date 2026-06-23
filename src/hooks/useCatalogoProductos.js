import { useQuery } from "@tanstack/react-query";
import { BuscarProductos, MostrarProductos } from "../supabase/crudProductos";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useProductosStore } from "../store/ProductosStore";

/**
 * Catálogo completo o resultados filtrados (nombre parecido / código de barras exacto).
 */
export function useCatalogoProductos(scope = "catalogo") {
  const { dataempresa } = useEmpresaStore();
  const { buscador } = useProductosStore();
  const idEmpresa = dataempresa?.id;
  const textoBusqueda = String(buscador ?? "").trim();

  const catalogoQuery = useQuery({
    queryKey: ["catalogo productos", scope, idEmpresa],
    queryFn: () => MostrarProductos({ _id_empresa: idEmpresa }),
    enabled: !!idEmpresa,
  });

  const busquedaQuery = useQuery({
    queryKey: ["buscar productos", scope, idEmpresa, textoBusqueda],
    queryFn: () =>
      BuscarProductos({ descripcion: textoBusqueda, id_empresa: idEmpresa }),
    enabled: !!idEmpresa && textoBusqueda.length > 0,
  });

  const productos =
    textoBusqueda.length > 0
      ? busquedaQuery.data ?? []
      : catalogoQuery.data ?? [];

  return {
    productos,
    textoBusqueda,
    isLoading: catalogoQuery.isLoading,
    isBuscando: busquedaQuery.isFetching,
    error: catalogoQuery.error ?? busquedaQuery.error,
  };
}
