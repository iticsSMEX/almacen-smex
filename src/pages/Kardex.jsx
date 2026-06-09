import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";
import { useProductosStore } from "../store/ProductosStore";
import { KardexTemplate } from "../components/templates/KardexTemplate";
import { useKardexStore } from "../store/KardexStore";

export function Kardex() {
  const { mostrarProductos, dataproductos, buscador, buscarProductos } =
    useProductosStore();
  const {
    mostrarKardex,
    buscarKardex,
    buscador: buscadorkardex,
  } = useKardexStore();
  const { dataempresa } = useEmpresaStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar productos", dataempresa?.id],
    queryFn: () => mostrarProductos({ _id_empresa: dataempresa?.id }),
    enabled: dataempresa?.id != null,
  });
  useQuery({
    queryKey: ["buscar productos", buscador],
    queryFn: () =>
      buscarProductos({ descripcion: buscador, id_empresa: dataempresa?.id }),
    enabled:
      dataempresa?.id != null && String(buscador ?? "").trim().length > 0,
  });
  useQuery({
    queryKey: ["mostrar kardex", dataempresa?.id],
    queryFn: () => mostrarKardex({ id_empresa: dataempresa?.id }),
    enabled: dataempresa?.id != null,
  });
  useQuery({
    queryKey: ["buscar kardex", buscadorkardex],
    queryFn: () =>
      buscarKardex({ buscador: buscadorkardex, id_empresa: dataempresa?.id }),
    enabled:
      dataempresa?.id != null &&
      String(buscadorkardex ?? "").trim().length > 0,
  });

  if (isLoading) {
    return <SpinnerLoader compact />;
  }
  if (error) {
    return <span>Error...</span>;
  }
  return <KardexTemplate data={dataproductos} />;
}
