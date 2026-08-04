-- Migración 2026-08-04 (b) — correr en el SQL Editor de Supabase.
-- Arregla: la tabla `clientes` no tenía ningún límite de envíos (hallazgo
-- de la auditoría de dev-sistemas). Ahora máximo 5 registros por IP cada hora.

alter table clientes add column if not exists ip text default ip_actual();

drop policy if exists "cualquiera puede registrarse como cliente" on clientes;

create policy "registro de cliente con limite de spam"
  on clientes for insert
  with check (
    (
      select count(*) from clientes c
      where c.ip = ip_actual()
        and c.creado_en > now() - interval '1 hour'
    ) < 5
  );
