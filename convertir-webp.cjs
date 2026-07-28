// Convierte las fotos reales de img/reales/*.jpg a .webp (mismo nombre, misma carpeta), sin borrar los originales.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const carpeta = path.join(__dirname, "img", "reales");
const archivos = fs.readdirSync(carpeta).filter((f) => f.toLowerCase().endsWith(".jpg"));

async function convertirTodo() {
  let pesoOriginalTotal = 0;
  let pesoWebpTotal = 0;
  let fallidos = [];

  for (const archivo of archivos) {
    const rutaJpg = path.join(carpeta, archivo);
    const rutaWebp = path.join(carpeta, archivo.replace(/\.jpg$/i, ".webp"));
    try {
      await sharp(rutaJpg).webp({ quality: 80 }).toFile(rutaWebp);
      pesoOriginalTotal += fs.statSync(rutaJpg).size;
      pesoWebpTotal += fs.statSync(rutaWebp).size;
    } catch (error) {
      fallidos.push({ archivo, error: error.message });
    }
  }

  console.log(`Convertidas: ${archivos.length - fallidos.length}/${archivos.length}`);
  console.log(`Peso original total: ${(pesoOriginalTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Peso WebP total: ${(pesoWebpTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Reducción: ${(100 - (pesoWebpTotal / pesoOriginalTotal) * 100).toFixed(1)}%`);
  if (fallidos.length) console.log("Fallidos:", fallidos);
}

convertirTodo();
