-- Cambia TU_PIN_AQUI por un PIN de 4 a 6 dígitos que solo tú y Jhinyerli
-- conozcan, ANTES de correr esto. No compartas ese PIN con Claude.
insert into admin_pin (id, pin_hash)
values (1, crypt('TU_PIN_AQUI', gen_salt('bf')))
on conflict (id) do update set pin_hash = excluded.pin_hash;
