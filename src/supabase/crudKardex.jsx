import { supabase } from "./supabase.config";
import Swal from "sweetalert2";

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

async function enriquecerKardex(rows) {
  if (!rows?.length) return [];

  const productIds = [
    ...new Set(rows.map((r) => r.id_producto).filter((x) => x != null)),
  ];
  const userIds = [
    ...new Set(rows.map((r) => r.id_usuario).filter((x) => x != null)),
  ];

  const prodMap = {};
  if (productIds.length) {
    const { data: prods, error: e1 } = await supabase
      .from("productos")
      .select("id, descripcion")
      .in("id", productIds);
    if (e1) console.error("enriquecerKardex productos", e1);
    (prods ?? []).forEach((p) => {
      prodMap[p.id] = p.descripcion ?? "";
    });
  }

  const userMap = {};
  if (userIds.length) {
    const { data: users, error: e2 } = await supabase
      .from("usuarios")
      .select("id, nombres")
      .in("id", userIds);
    if (e2) console.error("enriquecerKardex usuarios", e2);
    (users ?? []).forEach((u) => {
      userMap[u.id] = u.nombres ?? "";
    });
  }

  return rows.map((r) => ({
    id: r.id,
    fecha: r.fecha,
    tipo: r.tipo,
    cantidad: r.cantidad,
    detalle: r.detalle,
    stock: r.stock ?? "",
    id_empresa: r.id_empresa,
    id_producto: r.id_producto,
    id_usuario: r.id_usuario,
    descripcion: prodMap[r.id_producto] ?? "",
    nombres: userMap[r.id_usuario] ?? "",
  }));
}

/** Reporte PDF / consulta por empresa + producto (reemplaza RPC inexistente mostrarkardexempresa). */
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
  const { error } = await supabase.from("kardex").insert(p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
      footer: '<a href="">...</a>',
    });
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
        row.nombres,
        String(row.cantidad ?? ""),
        String(row.stock ?? ""),
      ].some((field) => String(field ?? "").toLowerCase().includes(q))
    );
  } catch (e) {
    console.error("BuscarKardex", e);
    return [];
  }
}
