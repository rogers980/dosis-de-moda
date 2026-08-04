// --- Efecto máquina de escribir en el eslogan del hero ---
function escribirTexto(elementoId, texto, velocidad = 55) {
  const el = document.getElementById(elementoId);
  let i = 0;
  function escribirLetra() {
    if (i < texto.length) {
      el.textContent += texto.charAt(i);
      i++;
      setTimeout(escribirLetra, velocidad);
    }
  }
  escribirLetra();
}

// --- Partículas doradas subiendo dentro del hero ---
function crearParticulas() {
  const capa = document.getElementById("capa-particulas");
  const cantidad = 22;

  for (let i = 0; i < cantidad; i++) {
    const particula = document.createElement("span");
    particula.className = "particula";
    particula.style.left = Math.random() * 100 + "%";
    particula.style.setProperty("--deriva", (Math.random() * 80 - 40) + "px");
    particula.style.animationDuration = 6 + Math.random() * 6 + "s";
    particula.style.animationDelay = Math.random() * 8 + "s";
    particula.style.width = particula.style.height = 3 + Math.random() * 5 + "px";
    capa.appendChild(particula);
  }
}

// --- Inclinación 3D del logo siguiendo el mouse ---
function activarTiltLogo() {
  const hero = document.getElementById("hero");
  const logo = document.getElementById("logo-3d");
  if (!hero || !logo) return;

  hero.addEventListener("mousemove", (evento) => {
    const rect = hero.getBoundingClientRect();
    const x = (evento.clientX - rect.left) / rect.width - 0.5;
    const y = (evento.clientY - rect.top) / rect.height - 0.5;
    logo.style.transform = `rotateY(${x * 25}deg) rotateX(${-y * 25}deg)`;
  });

  hero.addEventListener("mouseleave", () => {
    logo.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

// --- Revelado progresivo de secciones al hacer scroll ---
const observadorRevelado = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observadorRevelado.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15 }
);

function observarRevelado(elemento) {
  observadorRevelado.observe(elemento);
}

function iniciarRevelados() {
  document.querySelectorAll(".revelar").forEach((el) => observarRevelado(el));
}

// --- Botón "volver arriba" ---
function activarBotonArriba() {
  const boton = document.getElementById("btn-arriba");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      boton.classList.add("mostrar");
    } else {
      boton.classList.remove("mostrar");
    }
  });

  boton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// --- Arranque ---
escribirTexto("texto-escritura", "Tu estilo, en dosis perfectas");
crearParticulas();
activarTiltLogo();
iniciarRevelados();
activarBotonArriba();

// --- GSAP + ScrollTrigger: las imágenes del catálogo se "expanden" suavemente ---
// al entrar en el viewport (scale 0.92 -> 1, scrub con el scroll). Efecto puramente
// visual, separado del resto de este archivo para no mezclarlo con tienda.js.
//
// El grid de productos (#grid-productos) se reconstruye por completo con
// innerHTML="" cada vez que cambia un filtro, la búsqueda o el switch mayorista
// (ver tienda.js -> renderizarProductos()). Por eso usamos un MutationObserver en
// vez de correr esto una sola vez al cargar la página: así detectamos cada
// repintado del grid sin tener que modificar tienda.js.
(function () {
  const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefiereMenosMovimiento) return; // el usuario pidió menos animación: no tocamos nada, imágenes normales y quietas.

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return; // si el CDN no cargó, no rompemos nada.

  gsap.registerPlugin(ScrollTrigger);

  // Animamos el contenedor ".tarjeta-imagen" (no el <img> directamente): así no
  // pisamos la transición CSS del zoom al hacer :hover sobre la imagen
  // (.tarjeta-producto:hover .tarjeta-imagen img { transform: scale(1.12) }),
  // ni tocamos el layout flex-column de .tarjeta-producto (el botón sigue
  // alineado con margin-top:auto — transform no afecta el flujo del documento).
  let triggersActivosCatalogo = [];

  function animarImagenesCatalogo() {
    triggersActivosCatalogo.forEach((st) => st.kill());
    triggersActivosCatalogo = [];

    document.querySelectorAll("#grid-productos .tarjeta-imagen").forEach((contenedor) => {
      gsap.set(contenedor, { scale: 0.92, transformOrigin: "50% 50%" });

      const tween = gsap.to(contenedor, {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: contenedor,
          start: "top 88%",
          end: "top 55%",
          scrub: true,
        },
      });

      if (tween.scrollTrigger) triggersActivosCatalogo.push(tween.scrollTrigger);
    });
  }

  const gridProductos = document.getElementById("grid-productos");
  if (!gridProductos) return;

  let reprogramado = null;
  const observadorGrid = new MutationObserver(() => {
    clearTimeout(reprogramado);
    reprogramado = setTimeout(() => {
      animarImagenesCatalogo();
      ScrollTrigger.refresh();
    }, 50);
  });
  observadorGrid.observe(gridProductos, { childList: true });

  // Por si el grid ya tuviera contenido al momento de correr este script.
  animarImagenesCatalogo();
})();
