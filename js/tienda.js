// --- Número de WhatsApp de la tienda (reemplazar por el real, con código de país, sin + ni espacios) ---
const NUMERO_WHATSAPP = "584127661131";

// --- Estado del carrito, guardado en localStorage para que no se pierda al recargar la página ---
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearPrecio(valor) {
  return "$" + valor.toFixed(2);
}

// --- Filtro de categorías ---
const NOMBRES_CATEGORIA = {
  hombro: "De hombro",
  satchel: "Satchel",
  bandolera: "Bandolera",
  clutch: "Clutch",
  tote: "Tote",
  bucket: "Bucket",
  mini: "Mini",
};

let categoriaActiva = "todas";

function renderizarFiltros() {
  const contenedor = document.getElementById("filtros-categoria");
  const categorias = ["todas", ...new Set(productos.map((p) => p.categoria))];

  contenedor.innerHTML = categorias
    .map((cat) => {
      const etiqueta = cat === "todas" ? "Todas" : NOMBRES_CATEGORIA[cat] || cat;
      const activo = cat === categoriaActiva ? "activo" : "";
      return `<button class="chip-categoria ${activo}" data-categoria="${cat}">${etiqueta}</button>`;
    })
    .join("");

  document.querySelectorAll(".chip-categoria").forEach((chip) => {
    chip.addEventListener("click", () => {
      categoriaActiva = chip.dataset.categoria;
      renderizarFiltros();
      renderizarProductos();
    });
  });
}

// --- Pintar el catálogo de productos ---
function renderizarProductos() {
  const grid = document.getElementById("grid-productos");
  grid.innerHTML = "";

  const productosFiltrados =
    categoriaActiva === "todas"
      ? productos
      : productos.filter((p) => p.categoria === categoriaActiva);

  productosFiltrados.forEach((producto) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-producto revelar";
    tarjeta.innerHTML = `
      <div class="tarjeta-imagen">
        ${producto.nuevo ? '<span class="insignia-nuevo">Nuevo</span>' : ""}
        <img src="${producto.img}" alt="${producto.nombre}">
      </div>
      <h3>${producto.nombre}</h3>
      <p class="precio">${formatearPrecio(producto.precio)}</p>
      <button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
    `;
    grid.appendChild(tarjeta);
    observarRevelado(tarjeta);
  });

  document.querySelectorAll(".btn-agregar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      agregarAlCarrito(id);
      animarBotonAgregado(boton);
      animarIconoCarrito();
    });
  });
}

// --- Micro-animaciones al agregar un producto ---
function animarBotonAgregado(boton) {
  const textoOriginal = "Agregar al carrito";
  boton.textContent = "✓ Agregado";
  boton.classList.add("agregado");
  boton.disabled = true;

  setTimeout(() => {
    boton.textContent = textoOriginal;
    boton.classList.remove("agregado");
    boton.disabled = false;
  }, 1100);
}

function animarIconoCarrito() {
  const btnCarrito = document.getElementById("btn-carrito");
  btnCarrito.classList.add("rebote-carrito");
  setTimeout(() => btnCarrito.classList.remove("rebote-carrito"), 500);
}

// --- Lógica del carrito ---
function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  const itemExistente = carrito.find((item) => item.id === id);

  if (itemExistente) {
    itemExistente.cantidad++;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
  }

  guardarCarrito();
  renderizarCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find((item) => item.id === id);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter((i) => i.id !== id);
  }

  guardarCarrito();
  renderizarCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter((item) => item.id !== id);
  guardarCarrito();
  renderizarCarrito();
}

function calcularTotal() {
  return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function actualizarContador() {
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
  document.getElementById("contador-carrito").textContent = totalItems;
}

function renderizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío.</p>`;
  }

  carrito.forEach((item) => {
    const fila = document.createElement("div");
    fila.className = "item-carrito";
    fila.innerHTML = `
      <div class="item-carrito-info">
        <p class="item-carrito-nombre">${item.nombre}</p>
        <p class="item-carrito-precio">${formatearPrecio(item.precio)}</p>
      </div>
      <div class="item-carrito-controles">
        <button class="btn-cantidad" data-id="${item.id}" data-delta="-1">−</button>
        <span>${item.cantidad}</span>
        <button class="btn-cantidad" data-id="${item.id}" data-delta="1">+</button>
        <button class="btn-quitar" data-id="${item.id}">🗑️</button>
      </div>
    `;
    lista.appendChild(fila);
  });

  document.querySelectorAll(".btn-cantidad").forEach((boton) => {
    boton.addEventListener("click", () => {
      cambiarCantidad(Number(boton.dataset.id), Number(boton.dataset.delta));
    });
  });

  document.querySelectorAll(".btn-quitar").forEach((boton) => {
    boton.addEventListener("click", () => {
      quitarDelCarrito(Number(boton.dataset.id));
    });
  });

  document.getElementById("total-carrito").textContent = formatearPrecio(calcularTotal());
  actualizarContador();
}

// --- Abrir / cerrar el panel del carrito ---
function abrirCarrito() {
  document.getElementById("panel-carrito").classList.add("abierto");
  document.getElementById("overlay-carrito").classList.add("visible");
}

function cerrarCarrito() {
  document.getElementById("panel-carrito").classList.remove("abierto");
  document.getElementById("overlay-carrito").classList.remove("visible");
}

// --- Checkout por WhatsApp ---
function finalizarCompra() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega alguna cartera antes de finalizar la compra.");
    return;
  }

  let mensaje = "¡Hola! Quiero comprar estas carteras:%0A%0A";
  carrito.forEach((item) => {
    mensaje += `• ${item.nombre} x${item.cantidad} — ${formatearPrecio(item.precio * item.cantidad)}%0A`;
  });
  mensaje += `%0ATotal: ${formatearPrecio(calcularTotal())}`;

  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
  window.open(url, "_blank");
}

// --- Conectar los botones fijos de la página ---
document.getElementById("btn-carrito").addEventListener("click", abrirCarrito);
document.getElementById("btn-cerrar-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("overlay-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("btn-checkout").addEventListener("click", finalizarCompra);

// --- Enlaces de WhatsApp (botón flotante y sección de contacto) ---
const NUMERO_WHATSAPP_CREADOR = "584246101683";

function configurarEnlacesWhatsapp() {
  const mensaje = encodeURIComponent("¡Hola! Quiero más información sobre las carteras D&M Dosis de Moda.");
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
  document.getElementById("link-whatsapp-flotante").href = url;
  document.getElementById("link-whatsapp-contacto").href = url;

  const mensajeCreador = encodeURIComponent("¡Hola Roger! Vi tu tienda D&M Dosis de Moda y quiero una página como esa.");
  document.getElementById("link-whatsapp-creador").href = `https://wa.me/${NUMERO_WHATSAPP_CREADOR}?text=${mensajeCreador}`;
}

// --- Inicio ---
renderizarFiltros();
renderizarProductos();
renderizarCarrito();
configurarEnlacesWhatsapp();
