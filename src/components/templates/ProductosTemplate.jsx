import styled from "styled-components";
import { Header, Btnfiltro, v, RegistrarCategorias, Title, Lottieanimacion, TablaCategorias, Buscador, RegistrarProductos, useProductosStore, TablaProductos } from "../../index";
import { useState } from "react";
import vacio from "../../assets/vacio.json";
export function ProductosTemplate({data}) {
  const {setBuscador} = useProductosStore();
  const [state, setState] = useState(false);
  const [openRegistro, SetopenRegistro] = useState(false);
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  }
  return (
    <Container>
      {openRegistro && (
        <RegistrarProductos
          dataSelect={dataSelect}
          onClose={() => SetopenRegistro(!openRegistro)}
          accion={accion}
        />
      )}
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>
      <section className="area1">
        <ContentFiltro>
          <Title>
            Productos
          </Title>
          <Btnfiltro funcion={nuevoRegistro} icono={<v.agregar />} />
        </ContentFiltro>
      </section>
      <section className="area2">
        <Buscador
          setBuscador={setBuscador}
          placeholder="Nombre, código de barras o ubicación"
        />
      </section>
      <section className="main">
      {data?.length == 0 && (
          <Lottieanimacion
            alto="300"
            ancho="300"
            animacion={vacio}
          />
        )}

        <TablaProductos
          data={data}
          SetopenRegistro={SetopenRegistro}
          setdataSelect={setdataSelect}
          setAccion={setAccion}
        />
      </section>
    </Container>
  );
}
const Container = styled.div`
  min-height: 100%;
  padding: 16px 20px 24px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  grid-template:
    "header" 56px
    "area1" auto
    "area2" 48px
    "main" auto;
  gap: 12px;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .area1 {
    grid-area: area1;
    display: flex;
    align-items: center;
  }

  .area2 {
    grid-area: area2;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .main {
    grid-area: main;
  }
`;

const ContentFiltro = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
`;
