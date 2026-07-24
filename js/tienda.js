// --- Número de WhatsApp de la tienda (reemplazar por el real, con código de país, sin + ni espacios) ---
const NUMERO_WHATSAPP = "584127661131";

// --- Estado del carrito, guardado en localStorage para que no se pierda al recargar la página ---
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// --- Favoritos, guardados en localStorage ---
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

function guardarFavoritos() {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function alternarFavorito(id) {
  const indice = favoritos.indexOf(id);
  if (indice === -1) {
    favoritos.push(id);
  } else {
    favoritos.splice(indice, 1);
  }
  guardarFavoritos();
}

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

const ICONOS_CATEGORIA = {
  todas: "✨",
  hombro: "👜",
  satchel: "💼",
  bandolera: "🎒",
  clutch: "👝",
  tote: "🛍️",
  bucket: "🪣",
  mini: "👛",
};

let categoriaActiva = "todas";

function renderizarFiltros() {
  const contenedor = document.getElementById("filtros-categoria");
  const categorias = ["todas", ...new Set(productos.map((p) => p.categoria))];

  contenedor.innerHTML = categorias
    .map((cat) => {
      const etiqueta = cat === "todas" ? "Todas" : NOMBRES_CATEGORIA[cat] || cat;
      const icono = ICONOS_CATEGORIA[cat] || "";
      const activo = cat === categoriaActiva ? "activo" : "";
      return `<button class="chip-categoria ${activo}" data-categoria="${cat}"><span class="chip-icono">${icono}</span>${etiqueta}</button>`;
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
    const esFavorito = favoritos.includes(producto.id);
    tarjeta.innerHTML = `
      <div class="tarjeta-imagen" data-id="${producto.id}">
        ${producto.nuevo ? '<span class="insignia-nuevo">Nuevo</span>' : ""}
        <button class="btn-favorito ${esFavorito ? "activo" : ""}" data-id="${producto.id}" aria-label="Marcar como favorito">${esFavorito ? "❤️" : "🤍"}</button>
        <span class="tarjeta-brillo"></span>
        <img src="${producto.img}" alt="${producto.nombre}">
      </div>
      <h3 data-id="${producto.id}">${producto.nombre}</h3>
      <p class="precio">${formatearPrecio(producto.precio)}</p>
      <button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
    `;
    grid.appendChild(tarjeta);
    observarRevelado(tarjeta);
  });

  document.querySelectorAll(".btn-agregar").forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const id = Number(boton.dataset.id);
      agregarAlCarrito(id);
      animarBotonAgregado(boton);
      animarIconoCarrito();
      lanzarConfeti(e.clientX, e.clientY);
      mostrarToast("¡Agregado a tu bolsa! 🎉");
    });
  });

  document.querySelectorAll(".btn-favorito").forEach((boton) => {
    boton.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(boton.dataset.id);
      alternarFavorito(id);
      const activo = boton.classList.toggle("activo");
      boton.textContent = activo ? "❤️" : "🤍";
      if (activo) {
        boton.classList.add("latido");
        setTimeout(() => boton.classList.remove("latido"), 400);
      }
    });
  });

  document.querySelectorAll(".tarjeta-imagen, .tarjeta-producto h3").forEach((elemento) => {
    elemento.addEventListener("click", () => {
      abrirDetalleProducto(Number(elemento.dataset.id));
    });
  });
}

// --- Modal de detalle / inspección de producto ---
let detalleImagenes = [];
let detalleIndice = 0;

function obtenerImagenes(producto) {
  return producto.imagenes && producto.imagenes.length ? producto.imagenes : [producto.img];
}

function pintarImagenDetalle() {
  const img = document.getElementById("detalle-img");
  img.src = detalleImagenes[detalleIndice];
  img.classList.remove("zoom");

  const hayVarias = detalleImagenes.length > 1;
  document.getElementById("detalle-flecha-izq").hidden = !hayVarias;
  document.getElementById("detalle-flecha-der").hidden = !hayVarias;

  const puntos = document.getElementById("detalle-puntos");
  if (hayVarias) {
    puntos.innerHTML = detalleImagenes
      .map((_, i) => `<button class="detalle-punto ${i === detalleIndice ? "activo" : ""}" data-i="${i}"></button>`)
      .join("");
    puntos.querySelectorAll(".detalle-punto").forEach((punto) => {
      punto.addEventListener("click", () => {
        detalleIndice = Number(punto.dataset.i);
        pintarImagenDetalle();
      });
    });
  } else {
    puntos.innerHTML = "";
  }
}

function moverDetalle(delta) {
  const total = detalleImagenes.length;
  detalleIndice = (detalleIndice + delta + total) % total;
  pintarImagenDetalle();
}

function abrirDetalleProducto(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  detalleImagenes = obtenerImagenes(producto);
  detalleIndice = 0;
  pintarImagenDetalle();

  document.getElementById("detalle-img").alt = producto.nombre;
  document.getElementById("detalle-nombre").textContent = producto.nombre;
  document.getElementById("detalle-precio").textContent = formatearPrecio(producto.precio);
  document.getElementById("detalle-categoria").textContent = NOMBRES_CATEGORIA[producto.categoria] || producto.categoria;

  const insignia = document.getElementById("detalle-insignia");
  insignia.hidden = !producto.nuevo;

  const btnAgregar = document.getElementById("detalle-btn-agregar");
  btnAgregar.onclick = () => {
    agregarAlCarrito(id);
    animarBotonAgregado(btnAgregar);
    animarIconoCarrito();
  };

  document.getElementById("overlay-detalle").classList.add("visible");
  document.getElementById("modal-detalle").classList.add("abierto");
}

function cerrarDetalleProducto() {
  document.getElementById("overlay-detalle").classList.remove("visible");
  document.getElementById("modal-detalle").classList.remove("abierto");
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

// --- Confeti al agregar al carrito ---
const COLORES_CONFETI = ["#ff4d8d", "#7b2ff7", "#ffbe0b", "#00c9a7", "#ff8a5c"];

function lanzarConfeti(x, y) {
  const contenedor = document.getElementById("capa-confeti");
  if (!contenedor) return;

  for (let i = 0; i < 14; i++) {
    const particula = document.createElement("span");
    particula.className = "particula-confeti";
    const angulo = Math.random() * 360;
    const distancia = 60 + Math.random() * 60;
    const dx = Math.cos((angulo * Math.PI) / 180) * distancia;
    const dy = Math.sin((angulo * Math.PI) / 180) * distancia;
    particula.style.left = x + "px";
    particula.style.top = y + "px";
    particula.style.background = COLORES_CONFETI[i % COLORES_CONFETI.length];
    particula.style.setProperty("--dx", dx + "px");
    particula.style.setProperty("--dy", dy + "px");
    contenedor.appendChild(particula);
    setTimeout(() => particula.remove(), 900);
  }
}

// --- Toast de confirmación ---
let toastTimeout;
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2200);
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

// --- Contenido del modal de información (pie de página) ---
const INFO_CONTENIDO = {
  "preguntas": {
    titulo: "Preguntas frecuentes",
    cuerpo: `
      <h5>¿Cómo compro?</h5>
      <p>Elige tu cartera en el catálogo, agrégala al carrito y finaliza tu compra por WhatsApp — ahí te confirmamos el pago y el envío.</p>
      <h5>¿Hacen envíos a todo el país?</h5>
      <p>Sí, enviamos a toda Venezuela por Zoom, Tealca o MRW.</p>
      <h5>¿Puedo pagar en dólares?</h5>
      <p>Sí, aceptamos Zelle y Binance/USDT, además de pago móvil y transferencia bancaria.</p>
    `,
  },
  "como-comprar": {
    titulo: "Cómo comprar",
    cuerpo: `
      <p><strong>1.</strong> Elige tu cartera en el catálogo y agrégala al carrito.</p>
      <p><strong>2.</strong> Revisa tu carrito y presiona "Finalizar compra por WhatsApp".</p>
      <p><strong>3.</strong> Te confirmamos el pedido, el método de pago y coordinamos el envío por courier.</p>
    `,
  },
  "pagos": {
    titulo: "Métodos de pago",
    cuerpo: `
      <p>Aceptamos los siguientes métodos de pago:</p>
      <p>• Pago móvil<br>• Transferencia bancaria<br>• Zelle<br>• Binance / USDT</p>
      <p>Te confirmamos los datos de pago por WhatsApp al momento de hacer tu pedido.</p>
    `,
  },
  "envios": {
    titulo: "Envíos",
    cuerpo: `
      <p>Enviamos a toda Venezuela con Zoom, Tealca o MRW — eliges el que te quede más cómodo.</p>
      <p>Una vez confirmado tu pago, preparamos el pedido y te pasamos el número de guía, normalmente en 24-48 horas.</p>
    `,
  },
  "cambios": {
    titulo: "Cambios y devoluciones",
    cuerpo: `
      <p>Solo aceptamos cambios por defecto de fábrica. Si tu cartera llega dañada o con una falla, contáctanos dentro de las 48 horas siguientes a la entrega y la cambiamos sin costo.</p>
      <p>No se aceptan cambios por gusto, ya que cada pieza se despacha bajo pedido.</p>
    `,
  },
  "terminos": {
    titulo: "Términos de uso",
    cuerpo: `
      <p>D&M Dosis de Moda es un negocio independiente. Al comprar en esta página aceptas que los precios están en dólares (USD), que el pago se confirma antes del envío, y que la disponibilidad de cada cartera puede cambiar según el inventario real.</p>
      <p>Este texto es una guía general — si tienes dudas sobre un pedido puntual, escríbenos por WhatsApp.</p>
    `,
  },
  "privacidad": {
    titulo: "Política de privacidad",
    cuerpo: `
      <p>Tus datos (nombre, teléfono, dirección de envío) solo se usan para procesar tu pedido y coordinar el envío — no se comparten con terceros ni se usan para otro fin.</p>
      <p>La comunicación se maneja directamente por WhatsApp con Roger Soto, dueño de D&M Dosis de Moda.</p>
    `,
  },
};

function abrirInfo(clave) {
  const info = INFO_CONTENIDO[clave];
  if (!info) return;
  document.getElementById("info-titulo").textContent = info.titulo;
  document.getElementById("info-cuerpo").innerHTML = info.cuerpo;
  document.getElementById("overlay-info").classList.add("visible");
  document.getElementById("modal-info").classList.add("abierto");
}

function cerrarInfo() {
  document.getElementById("overlay-info").classList.remove("visible");
  document.getElementById("modal-info").classList.remove("abierto");
}

document.querySelectorAll("[data-info]").forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    abrirInfo(enlace.dataset.info);
  });
});

document.getElementById("btn-cerrar-info").addEventListener("click", cerrarInfo);
document.getElementById("overlay-info").addEventListener("click", cerrarInfo);

// --- Conectar los botones fijos de la página ---
document.getElementById("btn-carrito").addEventListener("click", abrirCarrito);
document.getElementById("btn-cerrar-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("overlay-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("btn-checkout").addEventListener("click", finalizarCompra);

// --- Conectar el modal de detalle de producto ---
document.getElementById("btn-cerrar-detalle").addEventListener("click", cerrarDetalleProducto);
document.getElementById("overlay-detalle").addEventListener("click", cerrarDetalleProducto);
document.getElementById("detalle-img").addEventListener("click", (e) => {
  e.target.classList.toggle("zoom");
});
document.getElementById("detalle-flecha-izq").addEventListener("click", () => moverDetalle(-1));
document.getElementById("detalle-flecha-der").addEventListener("click", () => moverDetalle(1));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cerrarDetalleProducto();
    cerrarInfo();
  }
  if (!document.getElementById("modal-detalle").classList.contains("abierto")) return;
  if (e.key === "ArrowLeft") moverDetalle(-1);
  if (e.key === "ArrowRight") moverDetalle(1);
});

// --- Enlaces de WhatsApp (botón flotante y sección de contacto) ---
const NUMERO_WHATSAPP_CREADOR = "584246101683";

function configurarEnlacesWhatsapp() {
  const mensaje = encodeURIComponent("¡Hola! Quiero más información sobre las carteras D&M Dosis de Moda.");
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
  document.getElementById("link-whatsapp-flotante").href = url;
  document.getElementById("link-whatsapp-contacto").href = url;
  document.getElementById("link-whatsapp-pie").href = url;

  const mensajeCreador = encodeURIComponent("¡Hola Roger! Vi tu tienda D&M Dosis de Moda y quiero una página como esa.");
  document.getElementById("link-whatsapp-creador").href = `https://wa.me/${NUMERO_WHATSAPP_CREADOR}?text=${mensajeCreador}`;
}

// --- Inicio ---
renderizarFiltros();
renderizarProductos();
renderizarCarrito();
configurarEnlacesWhatsapp();
