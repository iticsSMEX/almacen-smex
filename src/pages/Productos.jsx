import { useQuery } from "@tanstack/react-query";
import { useCategoriasStore } from "../store/CategoriasStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";
import { ProductosTemplate } from "../components/templates/ProductosTemplate";
import { useProductosStore } from "../store/ProductosStore";
import { useMarcaStore } from "../store/MarcaStore";
import { useCatalogoProductos } from "../hooks/useCatalogoProductos";
import { useEffect } from "react";

export function Productos() {
  const { setBuscador } = useProductosStore();
  const { mostrarCategorias } = useCategoriasStore();
  const { mostrarMarca } = useMarcaStore();
  const { dataempresa } = useEmpresaStore();
  const { productos, isLoading, error } = useCatalogoProductos("pagina-productos");

  useEffect(() => {
    setBuscador("");
    return () => setBuscador("");
  }, [setBuscador]);

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

  return <ProductosTemplate data={productos} />;
}
