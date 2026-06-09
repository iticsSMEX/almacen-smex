-- Si ves 404 en /rest/v1/rpc/mostrarempresaasignaciones, crea la función en Supabase (SQL Editor).
-- Ajusta el tipo de _id_usuario si en tu tabla asignarempresa.id_usuario no es integer.
-- Ajusta el nombre de la tabla de empresa si no es "empresa".

create or replace function public.mostrarempresaasignaciones(_id_usuario integer)
returns setof public.empresa
language sql
stable
security definer
set search_path = public
as $$
  select e.*
  from public.asignarempresa ae
  join public.empresa e on e.id = ae.id_empresa
  where ae.id_usuario = _id_usuario
  limit 1;
$$;
