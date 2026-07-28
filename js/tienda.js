// --- Número de WhatsApp de la tienda (reemplazar por el real, con código de país, sin + ni espacios) ---
const NUMERO_WHATSAPP = "584127661131";

// --- Estado del carrito, guardado en localStorage para que no se pierda al recargar la página ---
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// --- Favoritos, guardados en localStorage ---
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

function guardarFavoritos() {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

// --- Modo oscuro, guardado en localStorage ---
function aplicarModoOscuro(activo) {
  document.body.classList.toggle("oscuro", activo);
  const boton = document.getElementById("btn-modo-oscuro");
  if (boton) {
    boton.setAttribute("aria-pressed", String(activo));
    boton.setAttribute("aria-label", activo ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
}

function alternarModoOscuro() {
  const activo = !document.body.classList.contains("oscuro");
  localStorage.setItem("modoOscuro", activo ? "1" : "0");
  aplicarModoOscuro(activo);
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

// --- Compartir un producto por WhatsApp ---
const SVG_WHATSAPP = `<svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor"><path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.278.633 4.41 1.732 6.227L4 29l7.938-1.7A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.818c-1.94 0-3.75-.57-5.27-1.55l-.378-.24-4.71 1.01 1.02-4.59-.25-.39A9.77 9.77 0 0 1 5.2 15c0-5.96 4.85-10.818 10.804-10.818 5.955 0 10.804 4.858 10.804 10.818 0 5.96-4.85 10.818-10.804 10.818zm5.94-8.1c-.324-.163-1.918-.946-2.215-1.054-.297-.108-.513-.163-.729.163-.216.325-.837 1.054-1.026 1.271-.19.216-.378.244-.702.081-.324-.163-1.367-.503-2.604-1.606-.963-.858-1.613-1.918-1.802-2.243-.19-.325-.02-.5.143-.663.146-.146.324-.38.486-.57.162-.19.216-.325.324-.542.108-.216.054-.406-.027-.57-.081-.163-.729-1.755-.999-2.404-.263-.632-.53-.546-.729-.556l-.62-.011c-.216 0-.567.081-.864.406-.297.325-1.134 1.108-1.134 2.702s1.161 3.134 1.323 3.35c.162.216 2.286 3.49 5.539 4.895.774.334 1.377.534 1.848.684.776.247 1.482.212 2.04.129.622-.093 1.918-.784 2.19-1.54.27-.758.27-1.407.19-1.54-.081-.135-.297-.216-.621-.379z"/></svg>`;

const URL_TIENDA = "https://rogers980.github.io/dosis-de-moda/";

function enlaceCompartir(producto) {
  const mensaje = encodeURIComponent(
    `Mirá esta cartera de D&M Dosis de Moda 😍\n${producto.nombre} — ${formatearPrecio(producto.precio)}\n${URL_TIENDA}`
  );
  return `https://wa.me/?text=${mensaje}`;
}

// --- Accesibilidad: trampa de foco para paneles/modales tipo diálogo ---
let elementoConFocoPrevio = null;

function obtenerFocables(contenedor) {
  return Array.from(
    contenedor.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter((el) => el.offsetParent !== null);
}

function activarTrampaFoco(contenedor) {
  elementoConFocoPrevio = document.activeElement;
  const focables = obtenerFocables(contenedor);
  if (focables.length) focables[0].focus();

  function manejarTab(e) {
    if (e.key !== "Tab") return;
    const focablesActuales = obtenerFocables(contenedor);
    if (!focablesActuales.length) return;
    const primero = focablesActuales[0];
    const ultimo = focablesActuales[focablesActuales.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  contenedor.addEventListener("keydown", manejarTab);
  contenedor._manejarTab = manejarTab;
}

function desactivarTrampaFoco(contenedor) {
  if (contenedor._manejarTab) {
    contenedor.removeEventListener("keydown", contenedor._manejarTab);
    delete contenedor._manejarTab;
  }
  if (elementoConFocoPrevio && typeof elementoConFocoPrevio.focus === "function") {
    elementoConFocoPrevio.focus();
  }
  elementoConFocoPrevio = null;
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

// --- Foto real representativa de cada categoría, para las burbujas de filtro estilo "historias" ---
const IMAGENES_CATEGORIA = {
  hombro: "img/reales/cartera-real-21.jpg",
  satchel: "img/reales/cartera-real-1.jpg",
  bandolera: "img/reales/cartera-real-2.jpg",
  clutch: "img/reales/cartera-real-7.jpg",
  tote: "img/reales/cartera-real-32.jpg",
  bucket: "img/reales/cartera-real-40.jpg",
  mini: "img/reales/cartera-real-46.jpg",
};

let categoriaActiva = "todas";
let soloFavoritos = false;
let textoBusqueda = "";
let filtroLinea = null;
let mapaStock = {};

// --- WebP con fallback a JPG (mismo nombre, misma carpeta) ---
function rutaWebp(rutaJpg) {
  return rutaJpg.replace(/\.jpe?g$/i, ".webp");
}

function etiquetaImagen(ruta, alt, extra = "") {
  return `<picture><source srcset="${rutaWebp(ruta)}" type="image/webp"><img src="${ruta}" alt="${alt}" ${extra}></picture>`;
}

function renderizarFiltros() {
  const contenedor = document.getElementById("filtros-categoria");
  const categorias = ["todas", ...new Set(productos.map((p) => p.categoria))];

  contenedor.innerHTML = categorias
    .map((cat) => {
      const etiqueta = cat === "todas" ? "Todas" : NOMBRES_CATEGORIA[cat] || cat;
      const imagen = IMAGENES_CATEGORIA[cat];
      const activo = cat === categoriaActiva ? "activo" : "";
      const avatar = imagen
        ? `<span class="burbuja-avatar" style="background-image:url('${imagen}')"></span>`
        : `<span class="burbuja-avatar burbuja-avatar-icono">${ICONOS_CATEGORIA[cat] || ""}</span>`;
      return `<button class="burbuja-categoria ${activo}" data-categoria="${cat}" aria-label="Filtrar por ${etiqueta}" aria-pressed="${cat === categoriaActiva}">${avatar}<span class="burbuja-etiqueta">${etiqueta}</span></button>`;
    })
    .join("");

  document.querySelectorAll(".burbuja-categoria").forEach((burbuja) => {
    burbuja.addEventListener("click", () => {
      filtroLinea = null;
      categoriaActiva = burbuja.dataset.categoria;
      renderizarFiltros();
      renderizarProductos();
    });
  });
}

// --- Líneas "Dosis" (vista general en la home, cápsulas por ocasión) ---
const LINEAS = {
  diaria: {
    nombre: "Dosis Diaria",
    descripcion: "Hombro, satchel y tote — las que cargas todos los días.",
    categorias: ["hombro", "satchel", "tote"],
    fotos: ["img/reales/cartera-real-21.jpg", "img/reales/cartera-real-32.jpg"],
    fondo: "linear-gradient(135deg,#7b2ff7,#2b1055)",
  },
  nocturna: {
    nombre: "Dosis Nocturna",
    descripcion: "Clutch y mini — para cuando el plan es de noche.",
    categorias: ["clutch", "mini"],
    fotos: ["img/reales/cartera-real-7.jpg", "img/reales/cartera-real-39.jpg"],
    fondo: "linear-gradient(135deg,#ff4d8d,#c22463)",
  },
  aventura: {
    nombre: "Dosis Aventura",
    descripcion: "Bandolera y bucket — plan casual, para el finde.",
    categorias: ["bandolera", "bucket"],
    fotos: ["img/reales/cartera-real-35.jpg", "img/reales/cartera-real-1.jpg"],
    fondo: "linear-gradient(135deg,#00c9a7,#0d7a68)",
  },
};

function irALineaDesdeCapsula(clave) {
  filtroLinea = clave;
  categoriaActiva = "todas";
  renderizarFiltros();
  renderizarProductos();
  document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderizarLineas() {
  const contenedor = document.getElementById("grid-lineas");
  if (!contenedor) return;

  contenedor.innerHTML = Object.entries(LINEAS)
    .map(([clave, linea], indice) => {
      const cantidad = productos.filter((p) => linea.categorias.includes(p.categoria)).length;
      return `
      <button class="capsula" data-linea="${clave}" style="--capsula-bg:${linea.fondo}">
        <span class="capsula-fotos">
          ${linea.fotos.map((f) => etiquetaImagen(f, linea.nombre)).join("")}
        </span>
        <span class="capsula-info">
          <span class="capsula-eyebrow">Línea ${String(indice + 1).padStart(2, "0")}</span>
          <span class="capsula-nombre">${linea.nombre}</span>
          <span class="capsula-desc">${linea.descripcion}</span>
          <span class="capsula-resumen"><span><b>${cantidad}</b>modelos</span><span><b>5</b>und. c/u</span></span>
        </span>
      </button>`;
    })
    .join("");

  contenedor.querySelectorAll(".capsula").forEach((capsula) => {
    capsula.addEventListener("click", () => irALineaDesdeCapsula(capsula.dataset.linea));
  });
}

// --- Buscador por nombre ---
function configurarBuscador() {
  const input = document.getElementById("input-buscador");
  const btnLimpiar = document.getElementById("btn-limpiar-buscador");
  if (!input || !btnLimpiar) return;

  input.addEventListener("input", () => {
    textoBusqueda = input.value;
    btnLimpiar.hidden = textoBusqueda.trim() === "";
    renderizarProductos();
  });

  btnLimpiar.addEventListener("click", () => {
    input.value = "";
    textoBusqueda = "";
    btnLimpiar.hidden = true;
    renderizarProductos();
    input.focus();
  });
}

// --- Pintar el catálogo de productos ---
function renderizarProductos() {
  const grid = document.getElementById("grid-productos");
  grid.innerHTML = "";

  let productosFiltrados;
  if (filtroLinea) {
    const categoriasLinea = LINEAS[filtroLinea].categorias;
    productosFiltrados = productos.filter((p) => categoriasLinea.includes(p.categoria));
  } else if (categoriaActiva === "todas") {
    productosFiltrados = productos;
  } else {
    productosFiltrados = productos.filter((p) => p.categoria === categoriaActiva);
  }

  if (soloFavoritos) {
    productosFiltrados = productosFiltrados.filter((p) => favoritos.includes(p.id));
  }

  const busqueda = textoBusqueda.trim().toLowerCase();
  if (busqueda) {
    productosFiltrados = productosFiltrados.filter((p) => p.nombre.toLowerCase().includes(busqueda));
  }

  const contadorResultados = document.getElementById("contador-resultados");
  if (contadorResultados) {
    contadorResultados.textContent = busqueda
      ? `${productosFiltrados.length} resultado${productosFiltrados.length === 1 ? "" : "s"} para "${textoBusqueda.trim()}"`
      : soloFavoritos
      ? `${productosFiltrados.length} favorito${productosFiltrados.length === 1 ? "" : "s"}`
      : filtroLinea
      ? `${productosFiltrados.length} modelos en ${LINEAS[filtroLinea].nombre}`
      : `Mostrando ${productosFiltrados.length} de ${productos.length}`;
  }

  if (busqueda && productosFiltrados.length === 0) {
    grid.innerHTML = `<p class="grid-vacio">No encontramos carteras que coincidan con "${textoBusqueda.trim()}". Probá con otro nombre o quitá el filtro de categoría.</p>`;
  } else if (soloFavoritos && productosFiltrados.length === 0) {
    grid.innerHTML = `<p class="grid-vacio">Todavía no marcaste ninguna cartera como favorita. Tócala en el corazón 🤍 para guardarla acá.</p>`;
  }

  productosFiltrados.forEach((producto) => {
    const tarjeta = document.createElement("div");
    const stock = mapaStock[producto.id];
    const agotado = stock === 0;
    tarjeta.className = "tarjeta-producto revelar" + (agotado ? " agotada" : "");
    const esFavorito = favoritos.includes(producto.id);
    const etiquetaStock =
      stock === undefined
        ? ""
        : agotado
        ? '<span class="etiqueta-stock agotado">Agotado</span>'
        : stock <= 2
        ? `<span class="etiqueta-stock poca">Quedan ${stock}</span>`
        : `<span class="etiqueta-stock">Quedan ${stock}</span>`;
    tarjeta.innerHTML = `
      <div class="tarjeta-imagen" data-id="${producto.id}">
        ${producto.nuevo ? '<span class="insignia-nuevo">Nuevo</span>' : producto.masVendido ? '<span class="insignia-vendido">🔥 Más Vendido</span>' : ""}
        ${etiquetaStock}
        <button class="btn-favorito ${esFavorito ? "activo" : ""}" data-id="${producto.id}" aria-label="Marcar como favorito">${esFavorito ? "❤️" : "🤍"}</button>
        <a href="${enlaceCompartir(producto)}" class="btn-compartir" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp" onclick="event.stopPropagation()">${SVG_WHATSAPP}</a>
        <span class="tarjeta-brillo"></span>
        ${etiquetaImagen(producto.img, producto.nombre, 'loading="lazy"')}
      </div>
      <h3 data-id="${producto.id}">${producto.nombre}</h3>
      ${
        producto.precioAntes
          ? `<p class="precio-oferta"><span class="precio-antes">${formatearPrecio(producto.precioAntes)}</span><span class="precio">${formatearPrecio(producto.precio)}</span></p>`
          : `<p class="precio">${formatearPrecio(producto.precio)}</p>`
      }
      <button class="btn-agregar" data-id="${producto.id}" ${agotado ? "disabled" : ""}>${agotado ? "Agotado" : "Agregar al carrito"}</button>
    `;
    grid.appendChild(tarjeta);
    observarRevelado(tarjeta);

    const imagenContenedor = tarjeta.querySelector(".tarjeta-imagen");
    const img = tarjeta.querySelector("img");
    if (img.complete) {
      imagenContenedor.classList.add("cargada");
    } else {
      img.addEventListener("load", () => imagenContenedor.classList.add("cargada"), { once: true });
      img.addEventListener("error", () => imagenContenedor.classList.add("cargada"), { once: true });
    }
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
      actualizarContadoresNav();

      if (soloFavoritos) {
        renderizarProductos();
        return;
      }

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

// --- Vistos recientemente, guardado en localStorage ---
const VISTOS_MAX = 6;

function obtenerVistos() {
  return JSON.parse(localStorage.getItem("vistosRecientemente")) || [];
}

function guardarVisto(id) {
  let vistos = obtenerVistos().filter((v) => v !== id);
  vistos.unshift(id);
  localStorage.setItem("vistosRecientemente", JSON.stringify(vistos.slice(0, VISTOS_MAX)));
}

function renderizarVistos() {
  const contenedor = document.getElementById("vistos-recientemente");
  const lista = document.getElementById("vistos-lista");
  if (!contenedor || !lista) return;

  const vistos = obtenerVistos()
    .map((id) => productos.find((p) => p.id === id))
    .filter(Boolean);

  if (!vistos.length) {
    contenedor.hidden = true;
    return;
  }

  contenedor.hidden = false;
  lista.innerHTML = vistos
    .map(
      (p) => `
      <button class="visto-item" data-id="${p.id}" aria-label="Ver ${p.nombre}">
        ${etiquetaImagen(p.img, p.nombre, 'loading="lazy"')}
      </button>`
    )
    .join("");

  lista.querySelectorAll(".visto-item").forEach((boton) => {
    boton.addEventListener("click", () => abrirDetalleProducto(Number(boton.dataset.id)));
  });
}

// --- Cross-sell: productos relacionados en el modal de detalle ---
function renderizarRelacionados(producto) {
  const contenedor = document.getElementById("detalle-relacionados");
  if (!contenedor) return;

  const relacionados = productos.filter((p) => p.categoria === producto.categoria && p.id !== producto.id).slice(0, 3);

  if (!relacionados.length) {
    contenedor.innerHTML = "";
    return;
  }

  contenedor.innerHTML = `
    <p class="detalle-relacionados-titulo">También te puede gustar</p>
    <div class="detalle-relacionados-lista">
      ${relacionados
        .map(
          (p) => `
        <button class="detalle-relacionado-item" data-id="${p.id}">
          ${etiquetaImagen(p.img, p.nombre, 'loading="lazy"')}
          <span>${formatearPrecio(p.precio)}</span>
        </button>`
        )
        .join("")}
    </div>
  `;

  contenedor.querySelectorAll(".detalle-relacionado-item").forEach((boton) => {
    boton.addEventListener("click", () => abrirDetalleProducto(Number(boton.dataset.id)));
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
  const fuenteWebp = document.getElementById("detalle-img-webp");
  img.src = detalleImagenes[detalleIndice];
  fuenteWebp.srcset = rutaWebp(detalleImagenes[detalleIndice]);
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
  document.getElementById("detalle-precio").innerHTML = producto.precioAntes
    ? `<span class="precio-antes">${formatearPrecio(producto.precioAntes)}</span> ${formatearPrecio(producto.precio)}`
    : formatearPrecio(producto.precio);
  document.getElementById("detalle-categoria").textContent = NOMBRES_CATEGORIA[producto.categoria] || producto.categoria;

  const insignia = document.getElementById("detalle-insignia");
  if (producto.nuevo) {
    insignia.textContent = "Nuevo";
    insignia.className = "insignia-nuevo";
    insignia.hidden = false;
  } else if (producto.masVendido) {
    insignia.textContent = "🔥 Más Vendido";
    insignia.className = "insignia-vendido";
    insignia.hidden = false;
  } else {
    insignia.hidden = true;
  }

  const btnAgregar = document.getElementById("detalle-btn-agregar");
  btnAgregar.onclick = (e) => {
    agregarAlCarrito(id);
    animarBotonAgregado(btnAgregar);
    animarIconoCarrito();
    lanzarConfeti(e.clientX, e.clientY);
  };

  const btnCompartir = document.getElementById("detalle-btn-compartir");
  btnCompartir.href = enlaceCompartir(producto);
  btnCompartir.innerHTML = SVG_WHATSAPP;

  guardarVisto(id);
  renderizarRelacionados(producto);

  document.getElementById("overlay-detalle").classList.add("visible");
  document.getElementById("modal-detalle").classList.add("abierto");
  activarTrampaFoco(document.getElementById("modal-detalle"));
}

function cerrarDetalleProducto() {
  const modal = document.getElementById("modal-detalle");
  if (!modal.classList.contains("abierto")) return;
  document.getElementById("overlay-detalle").classList.remove("visible");
  modal.classList.remove("abierto");
  desactivarTrampaFoco(modal);
  renderizarVistos();
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
  actualizarContadoresNav();
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
  activarTrampaFoco(document.getElementById("panel-carrito"));
}

function cerrarCarrito() {
  const panel = document.getElementById("panel-carrito");
  if (!panel.classList.contains("abierto")) return;
  panel.classList.remove("abierto");
  document.getElementById("overlay-carrito").classList.remove("visible");
  desactivarTrampaFoco(panel);
}

// --- Abrir / cerrar el menú de navegación (mobile) ---
function alternarMenu() {
  const boton = document.getElementById("btn-menu");
  const nav = document.getElementById("nav-principal");
  const abierto = boton.classList.toggle("abierto");
  nav.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", abierto);
}

function cerrarMenu() {
  document.getElementById("btn-menu").classList.remove("abierto");
  document.getElementById("nav-principal").classList.remove("abierto");
  document.getElementById("btn-menu").setAttribute("aria-expanded", "false");
}

// --- Checkout por WhatsApp ---
function finalizarCompra() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega alguna cartera antes de finalizar la compra.");
    return;
  }

  const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
  const courier = document.querySelector('input[name="courier"]:checked');

  let mensaje = "¡Hola! Quiero comprar estas carteras:%0A%0A";
  carrito.forEach((item) => {
    mensaje += `• ${item.nombre} x${item.cantidad} — ${formatearPrecio(item.precio * item.cantidad)}%0A`;
  });
  mensaje += `%0ATotal: ${formatearPrecio(calcularTotal())}`;
  if (metodoPago) mensaje += `%0AMétodo de pago: ${encodeURIComponent(metodoPago.value)}`;
  if (courier) mensaje += `%0AEnvío por: ${encodeURIComponent(courier.value)}`;

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
      <p>Sí, enviamos a toda Venezuela por Zoom, Tealca o MRW. También coordinamos entrega personal si estás en la zona.</p>
      <h5>¿Puedo pagar en dólares?</h5>
      <p>Sí, aceptamos Zelle y Binance/USDT, además de pago móvil, transferencia bancaria y efectivo.</p>
    `,
  },
  "como-comprar": {
    titulo: "Cómo comprar",
    cuerpo: `
      <p><strong>1.</strong> Elige tu cartera en el catálogo y agrégala al carrito.</p>
      <p><strong>2.</strong> Revisa tu carrito y presiona "Finalizar compra por WhatsApp".</p>
      <p><strong>3.</strong> Te confirmamos el pedido, el método de pago y coordinamos el envío por courier o la entrega personal.</p>
    `,
  },
  "pagos": {
    titulo: "Métodos de pago",
    cuerpo: `
      <p>Aceptamos los siguientes métodos de pago:</p>
      <p>• Pago móvil<br>• Transferencia bancaria<br>• Zelle<br>• Binance / USDT<br>• Efectivo</p>
      <p>Te confirmamos los datos de pago por WhatsApp al momento de hacer tu pedido.</p>
    `,
  },
  "envios": {
    titulo: "Envíos",
    cuerpo: `
      <p>Enviamos a toda Venezuela con Zoom, Tealca o MRW — eliges el que te quede más cómodo.</p>
      <p>Si estás cerca, también coordinamos entrega personal sin costo de courier.</p>
      <p>Una vez confirmado tu pago, preparamos el pedido y te pasamos el número de guía (o coordinamos la entrega), normalmente en 24-48 horas.</p>
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
  activarTrampaFoco(document.getElementById("modal-info"));
}

function cerrarInfo() {
  const modal = document.getElementById("modal-info");
  if (!modal.classList.contains("abierto")) return;
  document.getElementById("overlay-info").classList.remove("visible");
  modal.classList.remove("abierto");
  desactivarTrampaFoco(modal);
}

document.querySelectorAll("[data-info]").forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    abrirInfo(enlace.dataset.info);
  });
});

document.getElementById("btn-cerrar-info").addEventListener("click", cerrarInfo);
document.getElementById("overlay-info").addEventListener("click", cerrarInfo);

// --- Conectar el modo oscuro ---
aplicarModoOscuro(localStorage.getItem("modoOscuro") === "1");
document.getElementById("btn-modo-oscuro").addEventListener("click", alternarModoOscuro);

// --- Conectar los botones fijos de la página ---
document.getElementById("btn-carrito").addEventListener("click", abrirCarrito);
document.getElementById("btn-cerrar-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("overlay-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("btn-checkout").addEventListener("click", finalizarCompra);

// --- Conectar el menú hamburguesa (mobile) ---
document.getElementById("btn-menu").addEventListener("click", alternarMenu);
document.querySelectorAll(".nav-principal a").forEach((enlace) => {
  enlace.addEventListener("click", cerrarMenu);
});

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
    cerrarCarrito();
    if (typeof cerrarChat === "function") cerrarChat();
  }
  if (!document.getElementById("modal-detalle").classList.contains("abierto")) return;
  if (e.key === "ArrowLeft") moverDetalle(-1);
  if (e.key === "ArrowRight") moverDetalle(1);
});

// --- Swipe táctil en la galería del modal de detalle ---
(function configurarSwipeDetalle() {
  const contenedor = document.querySelector(".modal-detalle-imagen");
  if (!contenedor) return;
  let xInicio = null;

  contenedor.addEventListener(
    "touchstart",
    (e) => {
      xInicio = e.touches[0].clientX;
    },
    { passive: true }
  );

  contenedor.addEventListener("touchend", (e) => {
    if (xInicio === null) return;
    const distancia = e.changedTouches[0].clientX - xInicio;
    if (Math.abs(distancia) > 40 && detalleImagenes.length > 1) {
      moverDetalle(distancia < 0 ? 1 : -1);
    }
    xInicio = null;
  });
})();

// --- Nav inferior fijo (mobile) ---
function actualizarContadoresNav() {
  const badgeFavoritos = document.getElementById("nav-contador-favoritos");
  if (badgeFavoritos) {
    badgeFavoritos.textContent = favoritos.length;
    badgeFavoritos.hidden = favoritos.length === 0;
  }
  const badgeCarrito = document.getElementById("nav-contador-carrito");
  if (badgeCarrito) {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    badgeCarrito.textContent = totalItems;
    badgeCarrito.hidden = totalItems === 0;
  }
}

function configurarNavInferior() {
  const btnFavoritos = document.getElementById("nav-inferior-favoritos");
  const btnCarrito = document.getElementById("nav-inferior-carrito");
  if (!btnFavoritos || !btnCarrito) return;

  btnFavoritos.addEventListener("click", () => {
    soloFavoritos = !soloFavoritos;
    btnFavoritos.classList.toggle("activo", soloFavoritos);
    btnFavoritos.setAttribute("aria-pressed", String(soloFavoritos));
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    renderizarProductos();
  });

  btnCarrito.addEventListener("click", abrirCarrito);
  actualizarContadoresNav();
}

// --- Enlaces de WhatsApp (botón flotante y sección de contacto) ---
const NUMERO_WHATSAPP_CREADOR = "584246101683";

function configurarEnlacesWhatsapp() {
  const mensaje = encodeURIComponent("¡Hola! Quiero más información sobre las carteras D&M Dosis de Moda.");
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
  document.getElementById("link-whatsapp-flotante").href = url;
  document.getElementById("link-whatsapp-contacto").href = url;
  document.getElementById("link-whatsapp-pie").href = url;
  document.getElementById("link-whatsapp-nav-inferior").href = url;

  const mensajeCreador = encodeURIComponent("¡Hola Roger! Vi tu tienda D&M Dosis de Moda y quiero una página como esa.");
  document.getElementById("link-whatsapp-creador").href = `https://wa.me/${NUMERO_WHATSAPP_CREADOR}?text=${mensajeCreador}`;
}

// --- Mini carrusel de destacados en el hero ---
function iniciarDestacados() {
  const contenedor = document.getElementById("destacado-mini");
  if (!contenedor) return;

  const destacados = productos.filter((p) => p.nuevo).slice(0, 6);
  if (destacados.length === 0) return;

  let indice = 0;

  function pintar() {
    const producto = destacados[indice];
    document.getElementById("destacado-img").src = producto.img;
    document.getElementById("destacado-nombre").textContent = producto.nombre;
    document.getElementById("destacado-precio").textContent = formatearPrecio(producto.precio);
  }

  pintar();

  setInterval(() => {
    contenedor.classList.add("cambiando");
    setTimeout(() => {
      indice = (indice + 1) % destacados.length;
      pintar();
      contenedor.classList.remove("cambiando");
    }, 350);
  }, 3200);
}

// --- Inicio ---
renderizarLineas();
renderizarFiltros();
configurarBuscador();
renderizarProductos();
renderizarCarrito();
renderizarVistos();
configurarEnlacesWhatsapp();
configurarNavInferior();
iniciarDestacados();
