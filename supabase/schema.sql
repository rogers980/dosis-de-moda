-- D&M Dosis de Moda — esquema de stock real
-- Correr esto completo una sola vez en el SQL Editor de Supabase.

create extension if not exists pgcrypto;

-- Stock por producto (el id coincide con el id de js/productos.js)
create table if not exists stock (
  id integer primary key,
  nombre text,
  cantidad integer not null default 5 check (cantidad >= 0),
  actualizado_en timestamptz not null default now()
);

alter table stock enable row level security;

-- Cualquier visitante puede LEER el stock (para mostrar "quedan X" en el sitio)
create policy "lectura publica de stock"
  on stock for select
  using (true);

-- Nadie puede escribir directo a la tabla (ni insertar, ni actualizar, ni borrar)
-- salvo a través de la función confirmar_venta() de abajo.

-- Tabla con el PIN de administración, completamente bloqueada (sin políticas =
-- inaccesible para cualquiera, incluso con la anon key). Solo la puede leer
-- una función interna con privilegios elevados (security definer).
create table if not exists admin_pin (
  id integer primary key default 1,
  pin_hash text not null,
  constraint un_solo_pin check (id = 1)
);

alter table admin_pin enable row level security;
-- Sin políticas: ni lectura ni escritura pública. Bloqueada por diseño.

-- Función para registrar una venta confirmada por WhatsApp.
-- Descuenta 1 del stock del producto SOLO si el PIN es correcto.
create or replace function confirmar_venta(p_id integer, p_pin text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  pin_ok boolean;
  nuevo_stock integer;
begin
  select (pin_hash = crypt(p_pin, pin_hash)) into pin_ok
  from admin_pin where id = 1;

  if pin_ok is not true then
    raise exception 'PIN incorrecto';
  end if;

  update stock
    set cantidad = greatest(cantidad - 1, 0),
        actualizado_en = now()
    where id = p_id
    returning cantidad into nuevo_stock;

  return nuevo_stock;
end;
$$;

-- Permite que el sitio (con la anon key) pueda LLAMAR a la función,
-- pero la función en sí es la que exige el PIN correcto.
grant execute on function confirmar_venta(integer, text) to anon;

-- Función para reponer stock (por ejemplo, si llega mercancía nueva).
create or replace function reponer_stock(p_id integer, p_pin text, p_cantidad integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  pin_ok boolean;
  nuevo_stock integer;
begin
  select (pin_hash = crypt(p_pin, pin_hash)) into pin_ok
  from admin_pin where id = 1;

  if pin_ok is not true then
    raise exception 'PIN incorrecto';
  end if;

  update stock
    set cantidad = p_cantidad,
        actualizado_en = now()
    where id = p_id
    returning cantidad into nuevo_stock;

  return nuevo_stock;
end;
$$;

grant execute on function reponer_stock(integer, text, integer) to anon;
