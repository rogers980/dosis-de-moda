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

-- Rate limiting del PIN: registro de intentos fallidos por IP.
-- Sin esto, cualquiera con curl podía probar el PIN sin límite directo
-- contra el endpoint de Supabase, sin pasar por la UI del sitio.
create table if not exists intentos_pin (
  id bigint generated always as identity primary key,
  ip text not null,
  intentado_en timestamptz not null default now()
);

alter table intentos_pin enable row level security;
-- Sin políticas: nadie la lee/escribe directo, solo las funciones de abajo (security definer).

create index if not exists idx_intentos_pin_ip_fecha on intentos_pin (ip, intentado_en);

-- IP real del que llama, tal como la ve Supabase (cabecera x-forwarded-for
-- que pone el gateway de Supabase, no la de un proxy que el visitante controle).
create or replace function ip_actual()
returns text
language sql
stable
as $$
  select coalesce(
    (current_setting('request.headers', true)::json ->> 'x-forwarded-for'),
    'desconocida'
  );
$$;

-- Bloquea si esa IP ya falló 3 veces o más en los últimos 15 minutos.
create or replace function verificar_limite_intentos(p_ip text)
returns void
language plpgsql
as $$
declare
  fallidos integer;
begin
  select count(*) into fallidos
  from intentos_pin
  where ip = p_ip
    and intentado_en > now() - interval '15 minutes';

  if fallidos >= 3 then
    raise exception 'Demasiados intentos fallidos. Esperá 15 minutos e intentá de nuevo.';
  end if;
end;
$$;

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
  v_ip text;
begin
  v_ip := ip_actual();
  perform verificar_limite_intentos(v_ip);

  select (pin_hash = crypt(p_pin, pin_hash)) into pin_ok
  from admin_pin where id = 1;

  if pin_ok is not true then
    insert into intentos_pin (ip) values (v_ip);
    raise exception 'PIN incorrecto';
  end if;

  delete from intentos_pin where ip = v_ip;

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
  v_ip text;
begin
  v_ip := ip_actual();
  perform verificar_limite_intentos(v_ip);

  select (pin_hash = crypt(p_pin, pin_hash)) into pin_ok
  from admin_pin where id = 1;

  if pin_ok is not true then
    insert into intentos_pin (ip) values (v_ip);
    raise exception 'PIN incorrecto';
  end if;

  delete from intentos_pin where ip = v_ip;

  update stock
    set cantidad = p_cantidad,
        actualizado_en = now()
    where id = p_id
    returning cantidad into nuevo_stock;

  return nuevo_stock;
end;
$$;

grant execute on function reponer_stock(integer, text, integer) to anon;
