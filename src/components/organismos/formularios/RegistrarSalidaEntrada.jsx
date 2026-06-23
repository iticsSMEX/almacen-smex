import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Spinner,
  useOperaciones,
  Btnsave,
  useCategoriasStore,
  useMarcaStore,
  Buscador,
  useProductosStore,
  ListaGenerica,
} from "../../../index";
import { useForm } from "react-hook-form";
import { CirclePicker } from "react-color";
import Emojipicker from "emoji-picker-react";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useKardexStore } from "../../../store/KardexStore";
import {
  salidaKardexPermitida,
  stockRestanteTrasSalida,
} from "../../../supabase/crudKardex";
import { DEFAULT_USUARIO_ID } from "../../../config/appConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BuscarProductos, MostrarProductos } from "../../../supabase/crudProductos";
import { supabase } from "../../../supabase/supabase.config";
import Swal from "sweetalert2";
import {
  findProductoExactoBarra,
  formatProductoBusquedaSubtitle,
  pareceCodigoBarras,
} from "../../../utils/producto-busqueda";
export function RegistrarSalidaEntrada({ onClose, dataSelect, accion, tipo }) {
  const [stateListaProd, SetstateListaProd] = useState(false);
  const inputBusquedaRef = useRef(null);
  const {
    productoItemSelect,
    selectProductos,
    setBuscador,
    mostrarProductos,
    buscador,
  } = useProductosStore();

  const { insertarKardex } = useKardexStore();
  const { dataempresa } = useEmpresaStore();
  const queryClient = useQueryClient();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();

  const textoBusqueda = String(buscador ?? "").trim();
  const productoSeleccionado =
    productoItemSelect && productoItemSelect.id != null
      ? productoItemSelect
      : null;

  const { data: catalogoProductos = [] } = useQuery({
    queryKey: ["catalogo productos", "modal-kardex", dataempresa?.id],
    queryFn: () => MostrarProductos({ _id_empresa: dataempresa?.id }),
    enabled: dataempresa?.id != null,
  });

  const { data: productosBuscados = [] } = useQuery({
    queryKey: ["buscar productos", "modal-kardex", dataempresa?.id, textoBusqueda],
    queryFn: () =>
      BuscarProductos({
        descripcion: textoBusqueda,
        id_empresa: dataempresa?.id,
      }),
    enabled: dataempresa?.id != null && textoBusqueda.length > 0,
  });

  const listaProductos =
    textoBusqueda.length > 0 ? productosBuscados : catalogoProductos;

  const productoEnCatalogo = productoSeleccionado?.id
    ? listaProductos.find((p) => p.id === productoSeleccionado.id) ??
      catalogoProductos.find((p) => p.id === productoSeleccionado.id)
    : null;

  const stockMostrado =
    productoSeleccionado?.stock ?? productoEnCatalogo?.stock;

  const stockMinimo = Number(productoSeleccionado?.stock_minimo) || 0;
  const stockNumero = Number(stockMostrado);
  const maxSalidaPermitido =
    tipo === "salida" && Number.isFinite(stockNumero)
      ? Math.max(0, stockNumero - stockMinimo)
      : null;

  useEffect(() => {
    if (!productoSeleccionado?.id) return;

    let cancelado = false;
    (async () => {
      const { data } = await supabase
        .from("productos")
        .select("id, descripcion, stock, stock_minimo, codigobarras, codigointerno")
        .eq("id", productoSeleccionado.id)
        .maybeSingle();

      if (!cancelado && data) {
        selectProductos({ ...productoSeleccionado, ...data });
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [productoSeleccionado?.id, selectProductos]);

  useEffect(() => {
    setBuscador("");
    selectProductos({});
    SetstateListaProd(false);
    const timer = setTimeout(() => inputBusquedaRef.current?.focus(), 100);
    return () => {
      clearTimeout(timer);
      setBuscador("");
    };
  }, [tipo, setBuscador, selectProductos]);

  useEffect(() => {
    if (textoBusqueda.length > 0) {
      SetstateListaProd(true);
    }
  }, [textoBusqueda]);

  function elegirProducto(producto) {
    if (!producto?.id) return;
    selectProductos(producto);
    setBuscador("");
    SetstateListaProd(false);
    inputBusquedaRef.current?.focus();
  }

  async function confirmarBusqueda(texto) {
    const q = String(texto ?? "").trim();
    if (!q || !dataempresa?.id) return;

    const resultados = await BuscarProductos({
      descripcion: q,
      id_empresa: dataempresa.id,
    });
    if (!resultados?.length) return;

    const exacto = findProductoExactoBarra(resultados, q);
    elegirProducto(exacto ?? resultados[0]);
  }

  function manejarEnterBusqueda(e, valorInput) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    confirmarBusqueda(valorInput ?? buscador);
  }

  useEffect(() => {
    if (!pareceCodigoBarras(textoBusqueda) || !dataempresa?.id) return;

    const timer = setTimeout(async () => {
      const exacto = findProductoExactoBarra(productosBuscados, textoBusqueda);
      if (exacto) {
        elegirProducto(exacto);
        return;
      }
      await confirmarBusqueda(textoBusqueda);
    }, 400);

    return () => clearTimeout(timer);
  }, [textoBusqueda, productosBuscados, dataempresa?.id]);

  async function insertar(data) {
    if (accion === "Editar") {
      return;
    }

    if (!dataempresa?.id) {
      Swal.fire({
        icon: "warning",
        title: "Empresa no cargada",
        text: "Espere a que cargue la empresa o recargue la página.",
      });
      return;
    }

    if (!productoSeleccionado?.id) {
      Swal.fire({
        icon: "warning",
        title: "Producto requerido",
        text: "Seleccione un producto antes de guardar.",
      });
      return;
    }

    const cantidad = parseFloat(String(data.cantidad).replace(",", "."));
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "Indique una cantidad mayor a cero.",
      });
      return;
    }

    const detalle = String(data.detalle ?? "").trim();
    if (!detalle) {
      Swal.fire({
        icon: "warning",
        title: "Motivo requerido",
        text: "Indique el motivo del movimiento.",
      });
      return;
    }

    const stockActual = Number(productoSeleccionado.stock) || 0;
    const stockMin = Number(productoSeleccionado.stock_minimo) || 0;

    if (tipo === "salida") {
      if (!salidaKardexPermitida(stockActual, stockMin, cantidad)) {
        Swal.fire({
          icon: "error",
          title: "Salida no permitida",
          text:
            cantidad > stockActual
              ? `Solo hay ${stockActual} unidades en almacén.`
              : `Debe quedar al menos ${stockMin} en almacén por el stock mínimo.`,
        });
        return;
      }

      const restante = stockRestanteTrasSalida(stockActual, cantidad);
      if (restante === 0 || (stockMin > 0 && restante === stockMin)) {
        const confirmar = await Swal.fire({
          icon: "warning",
          title: restante === 0 ? "El stock quedará en cero" : "Stock en el mínimo",
          html:
            restante === 0
              ? `Al sacar <b>${cantidad}</b> unidad(es), el inventario quedará en <b>0</b>.<br/><br/>Será necesario registrar una <b>entrada</b> cuando reponga material.<br/><br/>¿Desea continuar?`
              : `Quedará en el stock mínimo (<b>${stockMin}</b>). ¿Desea continuar?`,
          showCancelButton: true,
          confirmButtonText: "Sí, registrar salida",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#ef552b",
        });
        if (!confirmar.isConfirmed) return;
      }
    }

    const p = {
      fecha: new Date(),
      tipo,
      id_usuario: DEFAULT_USUARIO_ID,
      id_producto: Number(productoSeleccionado.id),
      cantidad,
      detalle,
      id_empresa: Number(dataempresa.id),
    };
    const ok = await insertarKardex(p);
    if (ok) {
      await queryClient.invalidateQueries({ queryKey: ["catalogo productos"] });
      await queryClient.invalidateQueries({ queryKey: ["mostrar kardex"] });
      await mostrarProductos({ _id_empresa: dataempresa.id });
      onClose();
    }
  }
 
  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>{accion == "Editar" ? "Editar marca" : "Registrar "+ tipo}</h1>
          </section>

          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>
        <div className="contentBuscador">
          <Buscador
            inputRef={inputBusquedaRef}
            setBuscador={setBuscador}
            onFocus={() => SetstateListaProd(true)}
            onKeyDown={manejarEnterBusqueda}
            placeholder="Nombre, código de barras o ubicación"
          />

          {stateListaProd && (
            <ListaGenerica
              bottom="-250px"
              scroll="scroll"
              setState={() => SetstateListaProd(false)}
              data={listaProductos}
              funcion={elegirProducto}
              getSubtitle={formatProductoBusquedaSubtitle}
            />
          )}
        </div>

        <CardProducto $esSalida={tipo === "salida"}>
          <span className="nombre-producto">
            {productoSeleccionado?.descripcion ||
              "Escanee o busque un producto"}
          </span>
          {productoSeleccionado?.codigobarras ? (
            <span className="codigo-barras">
              Cód. barras: {productoSeleccionado.codigobarras}
            </span>
          ) : null}
          <span className="stock-actual">
            <span className="stock-etiqueta">stock actual:</span>{" "}
            <span className="stock-valor">
              {stockMostrado ?? "—"}
            </span>
          </span>
          {tipo === "salida" && maxSalidaPermitido != null && stockMostrado != null ? (
            <span className="stock-max-salida">
              Puede sacar hasta {maxSalidaPermitido} unidad(es)
              {stockMinimo > 0 ? ` (mínimo en almacén: ${stockMinimo})` : ""}
            </span>
          ) : null}
        </CardProducto>

        <form className="formulario" onSubmit={handleSubmit(insertar)}>
          <section>
            <article>
              <InputText icono={<v.iconomarca />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.descripcion}
                  type="text"
                  placeholder=""
                  {...register("cantidad", {
                    required: true,
                  })}
                />
                <label className="form__label">Cantidad</label>
                {errors.cantidad?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<v.iconomarca />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.descripcion}
                  type="text"
                  placeholder=""
                  {...register("detalle", {
                    required: true,
                  })}
                />
                <label className="form__label">Motivo</label>
                {errors.detalle?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>

            <div className="btnguardarContent">
              <Btnsave
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="#ef552b"
                disabled={!productoSeleccionado?.id}
              />
            </div>
          </section>
        </form>
      </div>
    </Container>
  );
}
const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    width: 500px;
    max-width: 85%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 20px;
        font-weight: 500;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .contentBuscador {
      position: relative;
    }
    .formulario {
      section {
        gap: 20px;
        display: flex;
        flex-direction: column;
        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }
  }
`;

const ContentTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  svg {
    font-size: 25px;
  }
  input {
    border: none;
    outline: none;
    background: transparent;
    padding: 2px;
    width: 40px;
    font-size: 28px;
  }
`;
const ContainerEmojiPicker = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;
const CardProducto = styled.section`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  border: 1px dashed
    ${({ $esSalida }) => ($esSalida ? "#ef4d4d" : "#54f04f")};
  background-color: ${({ $esSalida }) =>
    $esSalida ? "rgba(239, 77, 77, 0.12)" : "rgba(84, 240, 79, 0.1)"};
  padding: 10px;

  .nombre-producto {
    color: ${({ $esSalida }) => ($esSalida ? "#ef4d4d" : "#1fee61")};
    font-weight: bold;
  }

  .codigo-barras {
    font-size: 12px;
    color: #334155;
    margin-top: 4px;
  }

  .stock-etiqueta {
    color: #1e293b;
    font-weight: ${({ $esSalida }) => ($esSalida ? 700 : 500)};
  }

  .stock-valor {
    color: #000000;
    font-weight: 700;
  }

  .stock-max-salida {
    font-size: 12px;
    color: #b45309;
    margin-top: 6px;
    line-height: 1.35;
  }
`;
