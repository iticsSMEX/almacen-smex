import { useQuery } from "@tanstack/react-query";
import { CategoriasProTemplate } from "../components/templates/CategoriasProTemplate";
import { useCategoriasStore } from "../store/CategoriasStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";

export function Categorias() {
  const { mostrarCategorias, datacategorias, buscarCategorias, buscador } =
    useCategoriasStore();
  const { dataempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar categorias", dataempresa.id],
    queryFn: () => mostrarCategorias({ idempresa: dataempresa.id }),
    enabled: dataempresa.id != null,
  });
  useQuery({
    queryKey: ["buscar categorias", buscador],
    queryFn: () =>
      buscarCategorias({ descripcion: buscador, id_empresa: dataempresa.id }),
    enabled:
      dataempresa.id != null && String(buscador ?? "").trim().length > 0,
  });

  if (isLoading) {
    return <SpinnerLoader compact />;
  }
  if (error) {
    return <span>Error...</span>;
  }
  return <CategoriasProTemplate data={datacategorias} />;
}
