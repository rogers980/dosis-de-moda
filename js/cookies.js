// --- Banner de cookies para Google Analytics ---
// Sin esto, activar Analytics sin avisar es motivo real de denuncia (Meta/Google
// exigen avisar si usás herramientas de rastreo). Por defecto el consentimiento
// queda en "denied" (ver index.html) hasta que el visitante elija acá.
const CONSENTIMIENTO_KEY = "consentimientoAnalytics";

function aplicarConsentimientoGuardado() {
  const guardado = localStorage.getItem(CONSENTIMIENTO_KEY);
  if (guardado === "aceptado" && typeof gtag === "function") {
    gtag("consent", "update", { analytics_storage: "granted" });
  }
  return guardado;
}

function mostrarBannerCookies() {
  const yaDecidido = aplicarConsentimientoGuardado();
  if (yaDecidido) return;

  const banner = document.createElement("div");
  banner.id = "banner-cookies";
  banner.className = "banner-cookies";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Aviso de cookies");
  banner.innerHTML = `
    <p>Usamos cookies solo para saber qué carteras te interesan y mejorar la tienda. No vendemos tus datos.</p>
    <div class="banner-cookies-acciones">
      <button type="button" id="btn-cookies-rechazar" class="btn-cookies-rechazar">Rechazar</button>
      <button type="button" id="btn-cookies-aceptar" class="btn-cookies-aceptar">Aceptar</button>
    </div>`;
  document.body.appendChild(banner);

  document.getElementById("btn-cookies-aceptar").addEventListener("click", () => {
    localStorage.setItem(CONSENTIMIENTO_KEY, "aceptado");
    if (typeof gtag === "function") {
      gtag("consent", "update", { analytics_storage: "granted" });
    }
    banner.remove();
  });

  document.getElementById("btn-cookies-rechazar").addEventListener("click", () => {
    localStorage.setItem(CONSENTIMIENTO_KEY, "rechazado");
    banner.remove();
  });
}

mostrarBannerCookies();
