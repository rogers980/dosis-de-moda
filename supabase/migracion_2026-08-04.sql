-- Migración 2026-08-04 — correr esto UNA vez en el SQL Editor de Supabase
-- (proyecto dym-dosis-de-moda). Es aparte de schema.sql porque schema.sql
-- completo re-crearía una policy que ya existe y fallaría a mitad de camino.

-- 1. Tabla de clientes (nombre/teléfono/ciudad al finalizar compra)
create table if not exists clientes (
  id bigint generated always as identity primary key,
  nombre text not null,
  telefono text not null,
  ciudad text not null,
  creado_en timestamptz not null default now()
);

alter table clientes enable row level security;

create policy "cualquiera puede registrarse como cliente"
  on clientes for insert
  with check (true);

-- Sin policy de SELECT: nadie lee la lista de clientes con la clave pública.
-- Vos la ves en Supabase → Table Editor → clientes, con tu propio login.

-- 2. Rate limiting del PIN: 3 intentos fallidos por IP cada 15 minutos
create table if not exists intentos_pin (
  id bigint generated always as identity primary key,
  ip text not null,
  intentado_en timestamptz not null default now()
);

alter table intentos_pin enable row level security;

create index if not exists idx_intentos_pin_ip_fecha on intentos_pin (ip, intentado_en);

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

-- 3. Actualizar confirmar_venta y reponer_stock para exigir el límite de intentos
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
