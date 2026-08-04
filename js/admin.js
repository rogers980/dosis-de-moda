// --- Panel de administración de stock (no enlazado desde el nav, solo footer) ---
const SUPABASE_URL = "https://bhbyjqvkhhbupzqdfeak.supabase.co";
const SUPABASE_KEY = "sb_publishable_jvHJ-QQ3uw9Q_8MgUuymJw_3pGwEmA0";
const clientePanel = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function obtenerPin() {
  return sessionStorage.getItem("panelPin") || "";
}

function pedirPin() {
  const pin = prompt("PIN de administración:");
  if (pin) sessionStorage.setItem("panelPin", pin);
  return pin;
}

function olvidarPin() {
  sessionStorage.removeItem("panelPin");
}

async function cargarPanel() {
  const lista = document.getElementById("lista-panel");
  const { data, error } = await clientePanel.from("stock").select("id, cantidad");

  if (error) {
    lista.innerHTML = `<p class="panel-nota">No se pudo cargar el stock: ${error.message}</p>`;
    return;
  }

  const mapa = Object.fromEntries((data || []).map((fila) => [fila.id, fila.cantidad]));

  lista.innerHTML = productos
    .map((p) => {
      const cantidad = mapa[p.id];
      return `
      <div class="fila-panel">
        <img src="${p.img}" alt="${p.nombre}">
        <div class="fila-panel-info">
          <h3>${p.nombre}</h3>
          <span class="fila-panel-stock">Quedan <b>${cantidad ?? "—"}</b></span>
        </div>
        <div class="fila-panel-acciones">
          <button class="btn-vendida" data-id="${p.id}" ${cantidad === 0 ? "disabled" : ""}>-1 vendida</button>
          <input type="number" min="0" class="input-restock" data-id="${p.id}" placeholder="${cantidad ?? 0}">
          <button class="btn-guardar" data-id="${p.id}">Guardar</button>
        </div>
      </div>`;
    })
    .join("");

  document.querySelectorAll(".btn-vendida").forEach((boton) => {
    boton.addEventListener("click", () => confirmarVenta(Number(boton.dataset.id)));
  });

  document.querySelectorAll(".btn-guardar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const input = document.querySelector(`.input-restock[data-id="${boton.dataset.id}"]`);
      const valor = Number(input.value);
      if (input.value === "" || Number.isNaN(valor) || valor < 0) {
        alert("Escribe una cantidad válida (0 o más).");
        return;
      }
      reponerStock(Number(boton.dataset.id), valor);
    });
  });
}

async function confirmarVenta(id) {
  let pin = obtenerPin();
  if (!pin) pin = pedirPin();
  if (!pin) return;

  const { data, error } = await clientePanel.rpc("confirmar_venta", { p_id: id, p_pin: pin });
  if (error) {
    olvidarPin();
    alert("No se pudo confirmar: " + error.message);
    return;
  }
  if (data === -1) {
    olvidarPin();
    alert("PIN incorrecto.");
    return;
  }
  cargarPanel();
}

async function reponerStock(id, cantidad) {
  let pin = obtenerPin();
  if (!pin) pin = pedirPin();
  if (!pin) return;

  const { data, error } = await clientePanel.rpc("reponer_stock", { p_id: id, p_pin: pin, p_cantidad: cantidad });
  if (error) {
    olvidarPin();
    alert("No se pudo guardar: " + error.message);
    return;
  }
  if (data === -1) {
    olvidarPin();
    alert("PIN incorrecto.");
    return;
  }
  cargarPanel();
}

cargarPanel();
