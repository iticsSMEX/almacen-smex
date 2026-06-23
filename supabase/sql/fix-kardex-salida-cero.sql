-- =============================================================================
-- Permite salidas que dejen el stock en 0 (respeta stock_minimo > 0).
-- Ejecutar en Supabase → SQL Editor → Run
-- =============================================================================

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'kardex'
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.kardex', r.tgname);
    RAISE NOTICE 'Trigger eliminado: %', r.tgname;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.fn_kardex_movimiento_stock()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock numeric;
  v_minimo numeric;
BEGIN
  SELECT stock, COALESCE(stock_minimo, 0)
    INTO v_stock, v_minimo
    FROM productos
   WHERE id = NEW.id_producto
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;

  IF NEW.tipo = 'entrada' THEN
    UPDATE productos
       SET stock = v_stock + NEW.cantidad
     WHERE id = NEW.id_producto;
  ELSIF NEW.tipo = 'salida' THEN
    IF NEW.cantidad > v_stock THEN
      RAISE EXCEPTION 'Stock agotado para este producto';
    END IF;

    -- Permitir quedar en 0 si stock_minimo = 0; solo bloquear si queda POR DEBAJO del mínimo
    IF (v_stock - NEW.cantidad) < v_minimo THEN
      RAISE EXCEPTION 'Stock agotado para este producto';
    END IF;

    UPDATE productos
       SET stock = v_stock - NEW.cantidad
     WHERE id = NEW.id_producto;
  ELSE
    RAISE EXCEPTION 'Tipo de movimiento inválido';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_kardex_movimiento_stock ON public.kardex;

CREATE TRIGGER trg_kardex_movimiento_stock
  BEFORE INSERT ON public.kardex
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_kardex_movimiento_stock();
