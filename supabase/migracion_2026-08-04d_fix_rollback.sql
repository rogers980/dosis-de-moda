-- Migración 2026-08-04 (d) — URGENTE, correr en el SQL Editor de Supabase.
-- Bug real: intentos_pin nunca guardaba ninguna fila. Confirmado con curl:
-- 5 intentos fallidos seguidos, 0 filas en intentos_pin.
-- Causa: la función hacía "insert ...; raise exception 'PIN incorrecto';"
-- en la misma transacción. Postgres deshace TODO lo que pasó en una
-- transacción que termina en excepción, incluido ese insert. El límite de
-- 3 intentos / 15 min nunca se activaba, para ningún atacante.
-- Fix: en vez de lanzar excepción, la función guarda el intento y devuelve
-- -1 (señal de "PIN incorrecto" sin abortar la transacción). El JS
-- (js/admin.js) ya se actualizó para interpretar data === -1 como PIN
-- incorrecto, en vez de depender de un error lanzado por Postgres.

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
    return -1;
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
    return -1;
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
