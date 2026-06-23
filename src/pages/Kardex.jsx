import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";
import { KardexTemplate } from "../components/templates/KardexTemplate";
import { useKardexStore } from "../store/KardexStore";
import { useCatalogoProductos } from "../hooks/useCatalogoProductos";

export function Kardex() {
  const { productos, isLoading, error } = useCatalogoProductos("pagina-kardex");
  const {
    mostrarKardex,
    buscarKardex,
    buscador: buscadorkardex,
  } = useKardexStore();
  const { dataempresa } = useEmpresaStore();

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
  return <KardexTemplate data={productos} />;
}
