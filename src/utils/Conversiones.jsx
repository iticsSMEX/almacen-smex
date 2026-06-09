export function ConvertirCapitalize(input) {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function formatTotalAlmacen(value) {
  const n = Number(value) || 0;
  const monto = n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `TOTAL $ ${monto}`;
}
