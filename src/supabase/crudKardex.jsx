import { supabase } from "./supabase.config";
import Swal from "sweetalert2";
import { DEFAULT_USUARIO_ID } from "../config/appConfig";

async function obtenerFilasKardex({ id_empresa, id_producto } = {}) {
  let q = supabase.from("kardex").select("*").order("fecha", { ascending: false });
  if (id_empresa != null) q = q.eq("id_empresa", id_empresa);
  if (id_producto != null) q = q.eq("id_producto", id_producto);
  const { data: rows, error } = await q;
  if (error) {
    console.error("obtenerFilasKardex", error);
    return [];
  }
  return rows ?? [];
}

function calcularStockPorProducto(rows, stockActualPorProducto) {
  const stockMap = {};
  const byProduct = {};

  rows.forEach((r) => {
    const pid = r.id_producto;
    if (pid == null) return;
    if (!byProduct[pid]) byProduct[pid] = [];
    byProduct[pid].push(r);
  });

  for (const [pid, productRows] of Object.entries(byProduct)) {
    const sorted = [...productRows].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
    let stockDespues = Number(stockActualPorProducto[pid]) || 0;

    for (const row of sorted) {
      stockMap[row.id] = stockDespues;
      const qty = Number(row.cantidad) || 0;
      if (row.tipo === "entrada") stockDespues -= qty;
      else if (row.tipo === "salida") stockDespues += qty;
    }
  }

  return stockMap;
}

async function enriquecerKardex(rows) {
  if (!rows?.length) return [];

  const productIds = [
    ...new Set(rows.map((r) => r.id_producto).filter((x) => x != null)),
  ];

  const prodMap = {};
  const stockActualPorProducto = {};

  if (productIds.length) {
    const { data: prods, error: e1 } = await supabase
      .from("productos")
      .select("id, descripcion, stock")
      .in("id", productIds);
    if (e1) console.error("enriquecerKardex productos", e1);
    (prods ?? []).forEach((p) => {
      prodMap[p.id] = p.descripcion ?? "";
      stockActualPorProducto[p.id] = Number(p.stock) || 0;
    });
  }

  const stockCalculado = calcularStockPorProducto(rows, stockActualPorProducto);

  return rows.map((r) => ({
    id: r.id,
    fecha: r.fecha,
    tipo: r.tipo,
    cantidad: r.cantidad,
    detalle: r.detalle ?? "",
    stock: stockCalculado[r.id] ?? r.stock ?? 0,
    id_empresa: r.id_empresa,
    id_producto: r.id_producto,
    descripcion: prodMap[r.id_producto] ?? "",
  }));
}

/** Reporte PDF / consulta por empresa + producto. */
export async function reportKardexPorProducto(p) {
  if (p?._id_empresa == null || p?._id_producto == null) return [];
  try {
    const rows = await obtenerFilasKardex({
      id_empresa: p._id_empresa,
      id_producto: p._id_producto,
    });
    return await enriquecerKardex(rows);
  } catch (e) {
    console.error("reportKardexPorProducto", e);
    return [];
  }
}

export async function InsertarKardex(p) {
  try {
    const { data: producto, error: errProd } = await supabase
      .from("productos")
      .select("id, stock")
      .eq("id", p.id_producto)
      .maybeSingle();

    if (errProd || !producto) {
      Swal.fire({
        icon: "error",
        title: "Producto no encontrado",
        text: errProd?.message ?? "No se pudo leer el stock del producto.",
      });
      return false;
    }

    const cantidad = Number(p.cantidad) || 0;
    const stockActual = Number(producto.stock) || 0;
    let stockNuevo = stockActual;

    if (p.tipo === "entrada") {
      stockNuevo = stockActual + cantidad;
    } else if (p.tipo === "salida") {
      if (cantidad > stockActual) {
        Swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          text: `Solo hay ${stockActual} unidades disponibles.`,
        });
        return false;
      }
      stockNuevo = stockActual - cantidad;
    }

    const { error: errUpdate } = await supabase
      .from("productos")
      .update({ stock: stockNuevo })
      .eq("id", p.id_producto);

    if (errUpdate) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar stock",
        text: errUpdate.message,
      });
      return false;
    }

    const payload = {
      fecha: p.fecha ?? new Date().toISOString(),
      tipo: p.tipo,
      cantidad,
      detalle: p.detalle ?? "",
      stock: stockNuevo,
      id_empresa: p.id_empresa,
      id_producto: p.id_producto,
    };

    if (DEFAULT_USUARIO_ID != null) {
      payload.id_usuario = DEFAULT_USUARIO_ID;
    }

    const { error } = await supabase.from("kardex").insert(payload);
    if (error) {
      await supabase
        .from("productos")
        .update({ stock: stockActual })
        .eq("id", p.id_producto);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
      return false;
    }

    return true;
  } catch (e) {
    console.error("InsertarKardex", e);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo registrar el movimiento.",
    });
    return false;
  }
}

export async function MostrarKardex(p) {
  try {
    const rows = await obtenerFilasKardex({ id_empresa: p?.id_empresa });
    return await enriquecerKardex(rows);
  } catch (e) {
    console.error("MostrarKardex", e);
    return [];
  }
}

export async function BuscarKardex(p) {
  try {
    const rows = await obtenerFilasKardex({ id_empresa: p?.id_empresa });
    const enriched = await enriquecerKardex(rows);
    const q = (p?.buscador ?? "").trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((row) =>
      [
        row.descripcion,
        row.detalle,
        row.tipo,
        String(row.cantidad ?? ""),
        String(row.stock ?? ""),
      ].some((field) => String(field ?? "").toLowerCase().includes(q)),
    );
  } catch (e) {
    console.error("BuscarKardex", e);
    return [];
  }
}
