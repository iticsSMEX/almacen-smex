import { Routes, Route, Navigate } from "react-router-dom";
import {
  Home,
  Configuracion,
  Categorias,
  Productos,
  Marca,
  Kardex,
  Reportes,
  StockActualPorProducto,
  StockBajoMinimo,
  KardexEntradaSalida,
  StockInventarioValorado,
} from "../index";

import StockActualTodos from "../components/organismos/report/StockActualTodos";
import { Layout } from "../hooks/Layout";

const withLayout = (page) => <Layout>{page}</Layout>;

export function MyRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={withLayout(<Home />)} />
      <Route path="/configurar" element={withLayout(<Configuracion />)} />
      <Route path="/configurar/categorias" element={withLayout(<Categorias />)} />
      <Route path="/configurar/productos" element={withLayout(<Productos />)} />
      <Route path="/configurar/marca" element={withLayout(<Marca />)} />
      <Route path="/kardex" element={withLayout(<Kardex />)} />
      <Route path="/reportes" element={withLayout(<Reportes />)}>
        <Route path="stock-actual-todos" element={<StockActualTodos />} />
        <Route
          path="stock-actual-por-producto"
          element={<StockActualPorProducto />}
        />
        <Route path="stock-bajo-minimo" element={<StockBajoMinimo />} />
        <Route
          path="kardex-entradas-salidas"
          element={<KardexEntradaSalida />}
        />
        <Route
          path="inventario-valorado"
          element={<StockInventarioValorado />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
