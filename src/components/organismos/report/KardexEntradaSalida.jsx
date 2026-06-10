import styled from "styled-components";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import {
  Buscador,
  ListaGenerica,
  useEmpresaStore,
  useProductosStore,
} from "../../../index";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function KardexEntradaSalida() {
  const [stateListaproductos, setstateListaProductos] = useState(false);
  const { reportKardexEntradaSalida, buscarProductos, buscador, setBuscador ,selectProductos,productoItemSelect} =
    useProductosStore();
  const { dataempresa } = useEmpresaStore();
  const idEmpresa = dataempresa?.id;
  const idProducto = productoItemSelect?.id;
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "reporte kardex entrada salida",
      { _id_empresa: idEmpresa, _id_producto: idProducto },
    ],
    queryFn: async () => {
      const rows = await reportKardexEntradaSalida({
        _id_empresa: idEmpresa,
        _id_producto: idProducto,
      });
      return rows ?? [];
    },
    enabled: Boolean(idEmpresa && idProducto),
  });
  const {
    data: dataproductosbuscador,
    isLoading: ProductosBuscador,
    error: errorBuscador,
  } = useQuery({
    queryKey: [
      "buscar productos",
      { id_empresa: dataempresa?.id, descripcion: buscador },
    ],
    queryFn: () =>
      buscarProductos({ id_empresa: dataempresa?.id, descripcion: buscador }),
    enabled: !!dataempresa,
  });

  // if (isLoading) {
  //   return <span>cargando</span>;
  // }
  // if (error) {
  //   return <span>Error {error.message}</span>;
  // }
  const styles = StyleSheet.create({
    page: { flexDirection: "row", position: "relative" },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    table: { width: "100%", margin: "auto", marginTop: 10 },
    row: {
      flexDirection: "row",
      borderBottom: 1,
      borderBottomColor: "#121212",
      alignItems: "stretch",
      height: 24,
      borderLeftColor: "#000",
      borderLeft: 1,
      textAlign: "left",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    cell: {
      flex: 1,
      textAlign: "center",

      borderLeftColor: "#000",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    headerCell: {
      flex: 1,
      backgroundColor: "#dcdcdc",
      fontWeight: "bold",

      textAlign: "left",
      justifyContent: "flex-start",
      alignItems: "center",
      textAlign: "center",
    },
  });
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
  const formatoFecha = (v) => {
    if (v == null || v === "") return "";
    if (typeof v === "string") return v;
    try {
      return new Date(v).toLocaleString();
    } catch {
      return String(v);
    }
  };
  const renderTableRow = (rowData, isHeader = false) => (
    <View style={styles.row} key={rowData.id ?? rowData._key}>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.detalle}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.descripcion}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.tipo}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.cantidad}

      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {formatoFecha(rowData.fecha)}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.stock}
      </Text>
    </View>
  );
  return (
    <Container>
      <Buscador
        funcion={() => setstateListaProductos(!stateListaproductos)}
        setBuscador={setBuscador}
      />
      {stateListaproductos && (
        <ListaGenerica funcion={(p)=>{
          selectProductos(p)
          setBuscador("")
        }}
          setState={() => setstateListaProductos(!stateListaproductos)}
          data={dataproductosbuscador}
        />
      )}

      {!idProducto && (
        <MensajeSeleccion>
          Use el buscador y elija un producto para ver entradas y salidas en el
          reporte.
        </MensajeSeleccion>
      )}

      <PDFViewer className="pdfviewer">
        <Document title="Reporte de stock todos">
          <Page size="A4" orientation="landscape">
            <View style={styles.page}>
              <View style={styles.section}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "ultrabold",
                    marginBottom: 10,
                  }}
                >
                   Kardex - entrada y salida por producto
                </Text>
                <Text>Fecha y hora del reporte: {formattedDate}</Text>
                <View style={styles.table}>
                  {renderTableRow(
                    {
                      _key: "header",
                      detalle: "Motivo",
                      descripcion: "Producto",
                      tipo:"Tipo",
                      cantidad:"Cantidad",
                      fecha:"Fecha",
                      stock: "Stock",
                    },
                    true
                  )}
                  {data?.map((movement) => renderTableRow(movement))}
                </View>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </Container>
  );
}

const MensajeSeleccion = styled.p`
  margin: 0;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bgtotal};
  border: 1px solid rgba(115, 115, 115, 0.35);
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
`;

const Container = styled.div`
  width: 100%;
  height: 80vh;
display:flex;
flex-direction:column;
gap:15px;
  .pdfviewer {
    width: 100%;
    height: 100%;
  }
`;
export default KardexEntradaSalida;
