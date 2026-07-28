// --- Stock real (Supabase) ---
// SUPABASE_URL y SUPABASE_KEY son datos públicos por diseño (clave "publishable"),
// protegidos por Row Level Security en la base de datos. Nunca poner aquí la
// service_role key ni ningún PIN.
const SUPABASE_URL = "https://bhbyjqvkhhbupzqdfeak.supabase.co";
const SUPABASE_KEY = "sb_publishable_jvHJ-QQ3uw9Q_8MgUuymJw_3pGwEmA0";

async function cargarStockReal() {
  try {
    const cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await cliente.from("stock").select("id, cantidad");
    if (error || !data) return;

    mapaStock = Object.fromEntries(data.map((fila) => [fila.id, fila.cantidad]));
    renderizarProductos();
  } catch (e) {
    // Sin stock en vivo, el catálogo sigue funcionando normal sin la etiqueta.
  }
}

cargarStockReal();
