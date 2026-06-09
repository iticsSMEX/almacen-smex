import { supabase } from "../index";
import { reportKardexPorProducto } from "./crudKardex";
import Swal from "sweetalert2";
const tabla = "productos";
export async function InsertarProductos(p) {
  try {
    const { error } = await supabase.rpc("insertarproductos", p);
    if (error) {
      console.log("parametros", p);
      console.log("parametros", error.message);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
        footer: '<a href="">Agregue una nueva descripcion</a>',
      });
    }
  } catch (error) {
    throw error
  }
}
export async function MostrarProductos(p) {
  try {
    const { data } = await supabase.rpc("mostrarproductos", {
      _id_empresa: p._id_empresa,
    });
    return data;
  } catch (error) {}
}
export async function EliminarProductos(p) {
  try {
    const { error } = await supabase.from("productos").delete().eq("id", p.id);
    if (error) {
      alert("Error al eliminar", error);
    }
  } catch (error) {
    alert(error.error_description || error.message + " eliminar productos");
  }
}
export async function EditarProductos(p) {
  try {
    const { error } = await supabase.from("productos").update(p).eq("id", p.id);
    if (error) {
      alert("Error al editar producto", error);
    }
  } catch (error) {
    alert(error.error_description || error.message + " editar categorias");
  }
}

export async function BuscarProductos(p) {
  try {
    const { data } = await supabase.rpc("buscarproductos", {
      _id_empresa: p.id_empresa,
      buscador: p.descripcion,
    });
    return data;
  } catch (error) {}
}
//REPORTES
export async function ReportStockProductosTodos(p) {
  const { data, error } = await supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa);
  if (error) {
    console.error("ReportStockProductosTodos", error);
    return [];
  }
  return data ?? [];
}
export async function ReportStockXProducto(p) {
  if (p?.id_empresa == null || p?.id == null) {
    return [];
  }
  const { data, error } = await supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa)
    .eq("id", p.id);
  if (error) {
    console.error("ReportStockXProducto", error);
    return [];
  }
  return data ?? [];
}
export async function ReportStockBajoMinimo(p) {
  try {
    const { data, error } = await supabase.rpc("reportproductosbajominimo", p);
    if (error) {
      console.error("ReportStockBajoMinimo", error);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("ReportStockBajoMinimo", e);
    return [];
  }
}
export async function ReportKardexEntradaSalida(p) {
  try {
    const rows = await reportKardexPorProducto(p);
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.error("ReportKardexEntradaSalida", e);
    return [];
  }
}
export async function ReportInventarioValorado(p) {
  const { data, error } = await supabase.rpc("inventariovalorado", p);

  if (error) {
    console.error("ReportInventarioValorado", error);
    return [];
  }
  return data ?? [];
}

/** Solo el monto total — evita traer filas completas al Home. */
export async function ReportInventarioTotal(p) {
  const idEmpresa = p?._id_empresa ?? p?.id_empresa;
  if (idEmpresa == null) return 0;

  const { data, error } = await supabase.rpc("inventariovalorado", {
    _id_empresa: idEmpresa,
  });

  if (!error && Array.isArray(data)) {
    return data.reduce((acc, row) => acc + (Number(row.total) || 0), 0);
  }

  const { data: productos, error: prodError } = await supabase
    .from(tabla)
    .select("stock, preciocompra")
    .eq("id_empresa", idEmpresa);

  if (prodError) {
    console.error("ReportInventarioTotal", prodError);
    return 0;
  }

  return (productos ?? []).reduce(
    (acc, row) =>
      acc + (Number(row.stock) || 0) * (Number(row.preciocompra) || 0),
    0,
  );
}