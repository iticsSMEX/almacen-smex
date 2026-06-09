import { useEffect, useState } from "react";
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
import { DEFAULT_USUARIO_ID } from "../../../config/appConfig";

export function RegistrarSalidaEntrada({ onClose, dataSelect, accion, tipo }) {
  const [stateListaProd, SetstateListaProd] = useState(false);
  const [focused, setFocused] = useState(false);
  const { dataproductos, productoItemSelect, selectProductos, setBuscador } =
    useProductosStore();

  const { insertarKardex } = useKardexStore();
  const { dataempresa } = useEmpresaStore();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  async function insertar(data) {
    if (accion === "Editar") {
      // const p = {
      //   id: dataSelect.id,
      //   descripcion: data.nombre,
      // };
      // await editarMarca(p);
      // onClose();
    } else {
      const p = {
        fecha: new Date(),
        tipo: tipo,
        id_usuario: DEFAULT_USUARIO_ID,
        id_producto: productoItemSelect.id,
        cantidad:parseFloat( data.cantidad),
        detalle: data.detalle,
        id_empresa:dataempresa.id
      };
      await insertarKardex(p);
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
          <div onClick={() => SetstateListaProd(!stateListaProd)}>
            <Buscador
              setBuscador={setBuscador}
              onFocus={() => setFocused(true)}
            />
          </div>

          {stateListaProd && (
            <ListaGenerica
              bottom="-250px"
              scroll="scroll"
              setState={() => SetstateListaProd(!stateListaProd)}
              data={dataproductos}
              funcion={selectProductos}
            />
          )}
        </div>

        <CardProducto $esSalida={tipo === "salida"}>
          <span className="nombre-producto">
            {productoItemSelect.descripcion}
          </span>
          <span className="stock-actual">
            stock actual: {productoItemSelect.stock}
          </span>
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

  .stock-actual {
    color: #f6faf7;
  }
`;
