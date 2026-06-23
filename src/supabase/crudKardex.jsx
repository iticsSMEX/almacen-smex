import { supabase } from "./supabase.config";
import Swal from "sweetalert2";
import { DEFAULT_USUARIO_ID } from "../config/appConfig";

async function resolverIdUsuarioKardex() {
  if (DEFAULT_USUARIO_ID != null) return DEFAULT_USUARIO_ID;

  const { data, error } = await supabase
    .from("usuarios")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("resolverIdUsuarioKardex", error.message);
    return null;
  }
  return data?.id ?? null;
}

async function insertarFilaKardex(payload) {
  return supabase.from("kardex").insert(payload);
}

function construirPayloadKardex(p, idUsuario) {
  const tipo = String(p?.tipo ?? "").trim().toLowerCase();
  const cantidad = Number(p?.cantidad);
  const detalle = String(p.detalle ?? "").trim();
  const idEmpresa = Number(p.id_empresa);
  const idProducto = Number(p.id_producto);
  const idUsr = Number(idUsuario);

  return {
    fecha: normalizarFechaKardex(p.fecha),
    tipo,
    cantidad,
    detalle,
    id_empresa: idEmpresa,
    id_producto: idProducto,
    id_usuario: idUsr,
  };
}

function normalizarFechaKardex(fechaRaw) {
  const fecha =
    fechaRaw instanceof Date
      ? fechaRaw
      : fechaRaw != null
        ? new Date(fechaRaw)
        : new Date();
  if (Number.isNaN(fecha.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return fecha.toISOString().slice(0, 10);
}

/** Indica si la salida es válida: no baja del mínimo y no supera el stock. */
export function salidaKardexPermitida(stockActual, stockMinimo, cantidad) {
  const stock = Number(stockActual) || 0;
  const minimo = Number(stockMinimo) || 0;
  const cant = Number(cantidad) || 0;
  if (cant <= 0 || cant > stock) return false;
  return stock - cant >= minimo;
}

export function stockRestanteTrasSalida(stockActual, cantidad) {
  return (Number(stockActual) || 0) - (Number(cantidad) || 0);
}

function mensajeErrorKardex(error) {
  const partes = [error?.message, error?.details, error?.hint].filter(Boolean);
  return partes.join(" — ") || "No se pudo registrar el movimiento.";
}

async function obtenerFilasKardex({ id_empresa, id_producto } = {}) {
  let q = supabase
    .from("kardex")
    .select("*")
    .or("estado.eq.1,estado.is.null")
    .order("fecha", { ascending: false })
    .order("id", { ascending: false });
  if (id_empresa != null) q = q.eq("id_empresa", id_empresa);
  if (id_producto != null) q = q.eq("id_producto", id_producto);
  const { data: rows, error } = await q;
  if (error) {
    console.error("obtenerFilasKardex", error);
    return [];
  }
  return (rows ?? []).filter(
    (r) => !/prueba\s*script/i.test(String(r.detalle ?? "")),
  );
}

/**
 * Stock final después de cada movimiento, anclado al stock actual del producto.
 */
function calcularStockFinalPorFila(productRows, stockActualProducto) {
  const stockMap = {};
  if (!productRows?.length) return stockMap;

  const totalEntradas = productRows
    .filter((r) => r.tipo === "entrada")
    .reduce((s, r) => s + (Number(r.cantidad) || 0), 0);
  const totalSalidas = productRows
    .filter((r) => r.tipo === "salida")
    .reduce((s, r) => s + (Number(r.cantidad) || 0), 0);

  const stockInicial = stockActualProducto - totalEntradas + totalSalidas;

  const sorted = [...productRows].sort((a, b) => {
    const diff = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    if (diff !== 0) return diff;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  let stock = stockInicial;
  for (const row of sorted) {
    const qty = Number(row.cantidad) || 0;
    if (row.tipo === "entrada") stock += qty;
    else if (row.tipo === "salida") stock -= qty;
    stockMap[row.id] = stock;
  }

  return stockMap;
}

function calcularStockHistoricoPorFila(rows, stockActualPorProducto) {
  const stockMap = {};
  const byProduct = {};

  rows.forEach((r) => {
    const pid = r.id_producto;
    if (pid == null) return;
    if (!byProduct[pid]) byProduct[pid] = [];
    byProduct[pid].push(r);
  });

  for (const [pid, productRows] of Object.entries(byProduct)) {
    const porFila = calcularStockFinalPorFila(
      productRows,
      Number(stockActualPorProducto[pid]) || 0,
    );
    Object.assign(stockMap, porFila);
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

  const stockHistorico = calcularStockHistoricoPorFila(rows, stockActualPorProducto);

  return rows.map((r) => {
    const stockFila = stockHistorico[r.id];

    return {
      id: r.id,
      fecha: r.fecha,
      tipo: r.tipo,
      cantidad: r.cantidad,
      detalle: r.detalle ?? "",
      stock: Number.isFinite(stockFila) ? stockFila : 0,
      id_empresa: r.id_empresa,
      id_producto: r.id_producto,
      descripcion: prodMap[r.id_producto] ?? "",
    };
  });
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
    const idProducto = Number(p?.id_producto);
    const idEmpresa = Number(p?.id_empresa);
    const tipo = String(p?.tipo ?? "").trim().toLowerCase();
    const cantidad = Number(p?.cantidad);

    if (!Number.isFinite(idProducto) || !Number.isFinite(idEmpresa)) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Seleccione un producto antes de guardar.",
      });
      return false;
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "Indique una cantidad mayor a cero.",
      });
      return false;
    }

    if (tipo !== "entrada" && tipo !== "salida") {
      Swal.fire({
        icon: "error",
        title: "Tipo de movimiento inválido",
        text: "El tipo debe ser entrada o salida.",
      });
      return false;
    }

    const { data: producto, error: errProd } = await supabase
      .from("productos")
      .select("id, stock, stock_minimo")
      .eq("id", idProducto)
      .maybeSingle();

    if (errProd || !producto) {
      Swal.fire({
        icon: "error",
        title: "Producto no encontrado",
        text: errProd?.message ?? "No se pudo leer el stock del producto.",
      });
      return false;
    }

    const stockActual = Number(producto.stock) || 0;
    const stockMinimo = Number(producto.stock_minimo) || 0;
    const stockRestante = stockActual - cantidad;

    if (tipo === "salida") {
      if (!salidaKardexPermitida(stockActual, stockMinimo, cantidad)) {
        if (cantidad > stockActual) {
          Swal.fire({
            icon: "error",
            title: "Stock insuficiente",
            text: `Solo hay ${stockActual} unidades en almacén.`,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Salida no permitida",
            html: `Debe quedar al menos <b>${stockMinimo}</b> unidad(es) por el stock mínimo.<br/>Puede sacar como máximo <b>${Math.max(0, stockActual - stockMinimo)}</b>.`,
          });
        }
        return false;
      }
    }

    const idUsuario = p?.id_usuario ?? (await resolverIdUsuarioKardex());
    if (idUsuario == null) {
      Swal.fire({
        icon: "error",
        title: "Usuario no configurado",
        text: "Defina VITE_DEFAULT_USUARIO_ID en .env o registre un usuario en Supabase.",
      });
      return false;
    }

    const payload = construirPayloadKardex(p, idUsuario);
    const { error } = await insertarFilaKardex(payload);
    if (error) {
      const texto = mensajeErrorKardex(error);
      const esStock = /stock|agotado|insuficiente|negativ/i.test(texto);

      Swal.fire({
        icon: "error",
        title: esStock ? "Stock insuficiente" : "No se pudo registrar el movimiento",
        text: esStock
          ? `No hay stock suficiente para esta salida. Stock actual: ${stockActual}.`
          : texto,
      });
      return false;
    }

    if (tipo === "salida" && stockRestante === 0) {
      Swal.fire({
        icon: "info",
        title: "Stock en cero",
        text: "El inventario de este producto quedó en 0. Registre una entrada cuando reponga material.",
        timer: 6000,
        showConfirmButton: true,
      });
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

export async function AnularMovimientoKardex(id) {
  try {
    const { error } = await supabase
      .from("kardex")
      .update({ estado: 0 })
      .eq("id", id);
    if (error) {
      console.error("AnularMovimientoKardex", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("AnularMovimientoKardex", e);
    return false;
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
