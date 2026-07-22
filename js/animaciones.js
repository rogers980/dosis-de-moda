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

// --- Contador animado de estadísticas del hero ---
function animarContador(elemento) {
  const meta = Number(elemento.dataset.hasta);
  const duracion = 1400;
  const inicio = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    elemento.textContent = Math.floor(progreso * meta);
    if (progreso < 1) {
      requestAnimationFrame(paso);
    } else {
      elemento.textContent = meta;
    }
  }
  requestAnimationFrame(paso);
}

function activarContadoresHero() {
  const stats = document.querySelectorAll(".stat-numero");
  stats.forEach((stat) => animarContador(stat));
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
activarContadoresHero();
iniciarRevelados();
activarBotonArriba();
