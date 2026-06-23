import { supabase } from "../index";
import { reportKardexPorProducto } from "./crudKardex";
import {
  findProductoExactoBarra,
  normalizeCodigoBarras,
  rankProductosBusqueda,
} from "../utils/producto-busqueda";
import Swal from "sweetalert2";
const tabla = "productos";

/** Añade marca, categoría y color como en mostrarproductos (RPC). */
async function enriquecerProductosLista(productos) {
  if (!productos?.length) return productos ?? [];

  const marcaIds = [
    ...new Set(productos.map((p) => p.idmarca).filter((x) => x != null)),
  ];
  const catIds = [
    ...new Set(productos.map((p) => p.id_categoria).filter((x) => x != null)),
  ];

  const marcaMap = {};
  const catMap = {};

  if (marcaIds.length) {
    const { data: marcas } = await supabase
      .from("marca")
      .select("id, descripcion")
      .in("id", marcaIds);
    (marcas ?? []).forEach((m) => {
      marcaMap[m.id] = m.descripcion ?? "";
    });
  }

  if (catIds.length) {
    const { data: cats } = await supabase
      .from("categorias")
      .select("id, descripcion, color")
      .in("id", catIds);
    (cats ?? []).forEach((c) => {
      catMap[c.id] = c;
    });
  }

  return productos.map((p) => {
    const cat = catMap[p.id_categoria];
    return {
      ...p,
      marca: p.marca ?? marcaMap[p.idmarca] ?? "",
      categoria: p.categoria ?? cat?.descripcion ?? "",
      color: p.color ?? cat?.color ?? "",
    };
  });
}

export async function InsertarProductos(p) {  try {
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
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
      });
      return false;
    }
    return true;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "No se pudo guardar",
      text: error?.message ?? "Error al editar producto",
    });
    return false;
  }
}
/** Corrige stock en productos sin crear fila en kardex. */
export async function AjustarStockProducto({ id, stock }) {
  const stockNuevo = Number(stock);
  if (id == null || !Number.isFinite(stockNuevo)) {
    throw new Error("Id de producto y stock válido son requeridos.");
  }
  const { data, error } = await supabase
    .from(tabla)
    .update({ stock: stockNuevo })
    .eq("id", id)
    .select("id, descripcion, stock")
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Suma o resta unidades al stock actual sin kardex. */
export async function AjustarStockProductoDelta({ id, delta }) {
  const cambio = Number(delta);
  if (id == null || !Number.isFinite(cambio)) {
    throw new Error("Id de producto y delta válido son requeridos.");
  }
  const { data: actual, error: errLeer } = await supabase
    .from(tabla)
    .select("id, descripcion, stock")
    .eq("id", id)
    .maybeSingle();
  if (errLeer) throw errLeer;
  if (!actual) throw new Error("Producto no encontrado.");
  const stockNuevo = (Number(actual.stock) || 0) + cambio;
  return AjustarStockProducto({ id, stock: stockNuevo });
}

export async function BuscarProductos(p) {
  try {
    const idEmpresa = p.id_empresa;
    const q = String(p.descripcion ?? "").trim();
    if (!idEmpresa || !q) return [];

    const codigo = normalizeCodigoBarras(q);
    const variantesCodigo = [...new Set([codigo, codigo.replace(/\s/g, "")])].filter(
      Boolean
    );

    for (const cod of variantesCodigo) {
      const { data: exactoBarras } = await supabase
        .from(tabla)
        .select("*")
        .eq("id_empresa", idEmpresa)
        .eq("codigobarras", cod);
      if (Array.isArray(exactoBarras) && exactoBarras.length > 0) {
        return enriquecerProductosLista(exactoBarras);
      }
      const { data: porIlike } = await supabase
        .from(tabla)
        .select("*")
        .eq("id_empresa", idEmpresa)
        .ilike("codigobarras", cod);
      if (Array.isArray(porIlike) && porIlike.length > 0) {
        const exacto = findProductoExactoBarra(porIlike, cod);
        if (exacto) return enriquecerProductosLista([exacto]);      }
    }

    const { data: exactoUbic } = await supabase
      .from(tabla)
      .select("*")
      .eq("id_empresa", idEmpresa)
      .eq("codigointerno", codigo);
    if (Array.isArray(exactoUbic) && exactoUbic.length > 0) {
      return enriquecerProductosLista(exactoUbic);
    }
    const escaped = q.replace(/[%_\\]/g, (m) => `\\${m}`);
    const pattern = `%${escaped}%`;
    const orFilter = `descripcion.ilike."${pattern}",codigobarras.ilike."${pattern}",codigointerno.ilike."${pattern}"`;

    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .eq("id_empresa", idEmpresa)
      .or(orFilter)
      .limit(120);

    if (!error && Array.isArray(data) && data.length > 0) {
      const ranked = rankProductosBusqueda(data, q);
      if (ranked.length > 0) return enriquecerProductosLista(ranked);
    }
    if (error) {
      console.error("BuscarProductos query", error);
    }

    const { data: all, error: allErr } = await supabase
      .from(tabla)
      .select("*")
      .eq("id_empresa", idEmpresa)
      .limit(800);

    if (!allErr && Array.isArray(all)) {
      const fuzzy = rankProductosBusqueda(all, q);
      if (fuzzy.length > 0) return enriquecerProductosLista(fuzzy);
    }

    const { data: rpcData } = await supabase.rpc("buscarproductos", {
      _id_empresa: idEmpresa,
      buscador: q,
    });
    return enriquecerProductosLista(rankProductosBusqueda(rpcData ?? [], q));  } catch (error) {
    console.error("BuscarProductos", error);
    return [];
  }
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