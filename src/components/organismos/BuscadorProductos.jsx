import { useRef } from "react";
import { Buscador, ListaGenerica, useProductosStore } from "../../index";
import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../../store/EmpresaStore";
import { BuscarProductos } from "../../supabase/crudProductos";
import {
  findProductoExactoBarra,
  formatProductoBusquedaSubtitle,
  pareceCodigoBarras,
} from "../../utils/producto-busqueda";
import { useEffect, useState } from "react";
import styled from "styled-components";

/**
 * Buscador de productos con lista: nombre parecido, ubicación o código de barras exacto.
 */
export function BuscadorProductos({
  scope = "selector",
  onSeleccionar,
  placeholder = "Nombre, código de barras o ubicación",
  listaBottom = "-250px",
  mostrarListaAlInicio = false,
}) {
  const [listaAbierta, setListaAbierta] = useState(mostrarListaAlInicio);
  const inputRef = useRef(null);
  const { buscador, setBuscador, selectProductos } = useProductosStore();
  const { dataempresa } = useEmpresaStore();
  const textoBusqueda = String(buscador ?? "").trim();

  const { data: resultados = [] } = useQuery({
    queryKey: ["buscar productos", scope, dataempresa?.id, textoBusqueda],
    queryFn: () =>
      BuscarProductos({
        descripcion: textoBusqueda,
        id_empresa: dataempresa?.id,
      }),
    enabled: !!dataempresa?.id && textoBusqueda.length > 0,
  });

  useEffect(() => {
    if (textoBusqueda.length > 0) setListaAbierta(true);
  }, [textoBusqueda]);

  function elegir(producto) {
    if (!producto?.id) return;
    selectProductos(producto);
    onSeleccionar?.(producto);
    setBuscador("");
    setListaAbierta(false);
    inputRef.current?.focus();
  }

  async function confirmar(texto) {
    const q = String(texto ?? "").trim();
    if (!q || !dataempresa?.id) return;
    const filas = await BuscarProductos({
      descripcion: q,
      id_empresa: dataempresa.id,
    });
    if (!filas?.length) return;
    elegir(findProductoExactoBarra(filas, q) ?? filas[0]);
  }

  function manejarEnter(e, valorInput) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    confirmar(valorInput ?? buscador);
  }

  useEffect(() => {
    if (!pareceCodigoBarras(textoBusqueda) || !dataempresa?.id) return;
    const timer = setTimeout(async () => {
      const exacto = findProductoExactoBarra(resultados, textoBusqueda);
      if (exacto) {
        elegir(exacto);
        return;
      }
      await confirmar(textoBusqueda);
    }, 400);
    return () => clearTimeout(timer);
  }, [textoBusqueda, resultados, dataempresa?.id]);

  return (
    <Container>
      <Buscador
        inputRef={inputRef}
        setBuscador={setBuscador}
        onFocus={() => setListaAbierta(true)}
        onKeyDown={manejarEnter}
        placeholder={placeholder}
      />
      {listaAbierta && (
        <ListaGenerica
          bottom={listaBottom}
          scroll="scroll"
          setState={() => setListaAbierta(false)}
          data={textoBusqueda.length > 0 ? resultados : []}
          funcion={elegir}
          getSubtitle={formatProductoBusquedaSubtitle}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 280px;
`;
