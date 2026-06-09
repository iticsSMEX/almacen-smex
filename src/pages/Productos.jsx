import { useQuery } from "@tanstack/react-query";
import { useCategoriasStore } from "../store/CategoriasStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";
import { ProductosTemplate } from "../components/templates/ProductosTemplate";
import { useProductosStore } from "../store/ProductosStore";
import { useMarcaStore } from "../store/MarcaStore";

export function Productos() {
  const { mostrarProductos, dataproductos, buscador, buscarProductos } =
    useProductosStore();
  const { mostrarCategorias } = useCategoriasStore();
  const { mostrarMarca } = useMarcaStore();
  const { dataempresa } = useEmpresaStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar productos", dataempresa?.id],
    queryFn: () => mostrarProductos({ _id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });
  useQuery({
    queryKey: ["buscar productos", buscador],
    queryFn: () =>
      buscarProductos({ descripcion: buscador, id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id && String(buscador ?? "").trim().length > 0,
  });
  useQuery({
    queryKey: ["mostrar marcas", dataempresa?.id],
    queryFn: () => mostrarMarca({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });
  useQuery({
    queryKey: ["mostrar categorias", dataempresa?.id],
    queryFn: () => mostrarCategorias({ idempresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });

  if (isLoading) {
    return <SpinnerLoader compact />;
  }
  if (error) {
    return <span>Error...</span>;
  }

  return <ProductosTemplate data={dataproductos} />;
}
