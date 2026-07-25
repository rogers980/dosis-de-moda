// --- Chat con el asistente virtual del catálogo D&M Dosis de Moda ---
const CHAT_ENDPOINT = "https://tnwgqivmigqlckmiazhc.supabase.co/functions/v1/chat-web";
const CHAT_API_KEY = "sb_publishable__vqdpsAOeOFaAHIb7vg3jw_WhMkm7Su";
const CHAT_MENSAJE_ERROR = "No pude conectar en este momento. Escríbenos por WhatsApp.";
const CHAT_SALUDO_INICIAL = "¡Hola! Pregúntame por alguna cartera de nuestro catálogo (color, tipo, precio) 👜";

let chatAbierto = false;
let chatSaludoMostrado = false;

// --- Crear una burbuja de mensaje (usuario o bot) en la lista del chat ---
function crearBurbujaChat(texto, tipo) {
  const lista = document.getElementById("lista-chat");
  const burbuja = document.createElement("div");
  burbuja.className = `burbuja-chat burbuja-${tipo}`;
  burbuja.textContent = texto;
  lista.appendChild(burbuja);
  desplazarChatAbajo();
  return burbuja;
}

// --- Burbuja temporal de "escribiendo..." mientras llega la respuesta del backend ---
function crearBurbujaEscribiendo() {
  const lista = document.getElementById("lista-chat");
  const burbuja = document.createElement("div");
  burbuja.className = "burbuja-chat burbuja-bot burbuja-escribiendo";
  burbuja.innerHTML = "<span></span><span></span><span></span>";
  lista.appendChild(burbuja);
  desplazarChatAbajo();
  return burbuja;
}

function desplazarChatAbajo() {
  const lista = document.getElementById("lista-chat");
  lista.scrollTop = lista.scrollHeight;
}

// --- Abrir / cerrar el panel del chat ---
function abrirChat() {
  document.getElementById("panel-chat").classList.add("visible");
  document.getElementById("btn-chat").setAttribute("aria-expanded", "true");
  chatAbierto = true;

  if (!chatSaludoMostrado) {
    chatSaludoMostrado = true;
    crearBurbujaChat(CHAT_SALUDO_INICIAL, "bot");
  }
}

function cerrarChat() {
  document.getElementById("panel-chat").classList.remove("visible");
  document.getElementById("btn-chat").setAttribute("aria-expanded", "false");
  chatAbierto = false;
}

function alternarChat() {
  if (chatAbierto) {
    cerrarChat();
  } else {
    abrirChat();
  }
}

// --- Enviar el mensaje del cliente al backend y mostrar la respuesta real ---
async function enviarMensajeChat(mensaje) {
  const burbujaEscribiendo = crearBurbujaEscribiendo();

  try {
    const respuesta = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: CHAT_API_KEY,
      },
      body: JSON.stringify({ mensaje }),
    });

    const datos = await respuesta.json().catch(() => null);

    burbujaEscribiendo.classList.remove("burbuja-escribiendo");

    if (respuesta.ok && datos && typeof datos.respuesta === "string") {
      burbujaEscribiendo.textContent = datos.respuesta;
    } else {
      burbujaEscribiendo.textContent = CHAT_MENSAJE_ERROR;
    }
  } catch (error) {
    burbujaEscribiendo.classList.remove("burbuja-escribiendo");
    burbujaEscribiendo.textContent = CHAT_MENSAJE_ERROR;
  }

  desplazarChatAbajo();
}

// --- Conectar los controles del chat ---
document.getElementById("btn-chat").addEventListener("click", alternarChat);
document.getElementById("btn-cerrar-chat").addEventListener("click", cerrarChat);

document.getElementById("form-chat").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("input-chat");
  const texto = input.value.trim();
  if (!texto) return;

  crearBurbujaChat(texto, "usuario");
  input.value = "";
  enviarMensajeChat(texto);
});
