# D&M Dosis de Moda — guía del proyecto

> Nombre de este manual: **Roger Perfección**

Tienda online de carteras para damas. Negocio familiar real de Roger y su esposa Jhinyerli (no un side-project ni un ejercicio de práctica). Roger arma y mantiene la web; Jhinyerli atiende clientas por WhatsApp. Esta guía existe para que cualquiera (yo en una sesión futura, u otro programador que Roger contrate) mantenga el mismo estándar sin que Roger tenga que repetir las reglas cada vez.

## Stack

- HTML + CSS + JavaScript puro. **Sin frameworks, sin bundler, sin build step.** No agregar React, Vue, Tailwind, Framer Motion, ni nada que requiera compilar — se evaluó explícitamente y no aplica a este sitio (ver conversación 2026-07-28).
- Carrito con `localStorage`. Checkout y contacto vía enlaces de WhatsApp (`wa.me`) — no hay pasarela de pago real ni backend.
- Publicado en GitHub Pages (`rogers980.github.io/dosis-de-moda/`, repo `rogers980/dosis-de-moda`).
- Servidor local de desarrollo: `node servidor.cjs` (puerto 8765) — **siempre mostrar los cambios ahí (o en el sitio real) antes de dar por terminada una tarea.**

## Reglas de negocio que no se negocian

- **Solo fotos reales** de cada cartera (Pexels, uso comercial, sin rostros identificables, sin logos/marcas visibles de terceros). Nunca ilustraciones ni imágenes genéricas de stock genérico.
- **Nunca inventar datos de negocio**: precio, stock, ofertas, tarifas de envío. Si un dato real no se conoce, preguntar — no rellenar con un valor plausible.
- El inventario real son **unidades limitadas por modelo** (5 de cada uno al 2026-07-28) — no hay reposición automática ni sincronización en tiempo real entre clientes porque el sitio no tiene backend. Cualquier contador de "stock disponible" se actualiza a mano (igual que el contador de modelos en el hero) hasta que se decida sumar una base de datos real (Roger tiene experiencia con Supabase).

## Identidad visual

- **Colores de marca:** rosa `#ff4d8d`, morado `#7b2ff7`, naranja `#ff8a5c`, dorado `#ffbe0b`, turquesa `#00c9a7`, oscuro `#2b1055`, papel `#fff4e3` (para el elemento de etiqueta).
- **Tipografía:** Poppins (títulos/display), Quicksand (cuerpo), Space Mono (texto de "etiqueta"/dato técnico, ej. la etiqueta "Dosis Nº" del hero).
- **Concepto de marca (elemento firma):** el nombre "Dosis de Moda" se explota literalmente como una etiqueta de farmacia/receta ("Dosis Nº 43 · uso diario · sin receta") en vez de bloques de estadísticas genéricos. Si se agregan más piezas de marca en el futuro, mantener esta idea en vez de inventar una nueva sin razón.
- **Barra de exigencia de iconos:** nunca iconos de una sola línea genéricos ni emojis sueltos como iconografía funcional. Usar SVG con dos tonos de opacidad (silueta sólida + un detalle más claro/oscuro encima) para que se vean con peso y detalle — ver los iconos de la franja de beneficios (camión, audífonos, gancho de ropa) como referencia del nivel esperado.
- **Botones:** nada de círculos con degradado brillante tipo "dulce"/candy. Estilo sobrio: mismo tamaño entre botones agrupados, `gap` fijo (nunca depender de `justify-content: space-between` para separar botones que deben quedar juntos), colores planos o degradados discretos.
- Antes de tomar una decisión de diseño nueva, usar el skill `frontend-design` (evita los 3 looks genéricos de "hecho por IA": crema+serif+terracota, negro+neón, o periódico con líneas finas) y el skill `ui-ux-pro-max` como base de datos de referencia (paletas/tipografías/iconos) — pero la decisión final de qué es "genérico" vs. "propio de esta marca" la marca este documento, no el skill.

## Flujo de trabajo

1. Cambios de código → probar en el servidor local (o con la extensión de Chrome) antes de decir que algo está listo.
2. Commit y push solo cuando Roger lo pide explícitamente, o cuando ya dijo "sube" para ese bloque de cambios.
3. Antes de instalar cualquier herramienta/librería/skill nueva de un tercero, usar el skill `verify-before-install`.
4. Los pendientes reales del negocio (contenido de "Quiénes somos", tarifas de envío reales, seguridad del dominio/GitHub) viven en la memoria de Claude, no hace falta duplicarlos aquí.
