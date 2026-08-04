-- Migración 2026-08-04 (c) — URGENTE, correr en el SQL Editor de Supabase.
-- Bug real encontrado al probar el rate-limit del PIN con curl: confirmar_venta
-- y reponer_stock fallan SIEMPRE (incluso con PIN correcto) porque pgcrypto
-- vive en el esquema `extensions`, y las funciones tienen
-- `set search_path = public` (sin `extensions`), así que crypt() no se
-- encuentra. Error real que devuelve Supabase ahora mismo:
--   {"code":"42883","message":"function crypt(text, text) does not exist"}
-- Esto significa que HOY, en producción, no se puede confirmar ninguna venta
-- ni reponer stock con el PIN — el botón simplemente da error.

create or replace function confirmar_venta(p_id integer, p_pin text)
returns integer
language plpgsql
security definer
set search_path = public, extensions
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
set search_path = public, extensions
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
