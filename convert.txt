const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Carpetas de entrada y salida
const inputFolder = path.join(__dirname, 'temp_images');
const outputFolder = path.join(__dirname, 'public', 'images', 'rowe');

// Crear la carpeta de destino si no existe
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Leer y convertir los archivos
fs.readdirSync(inputFolder).forEach(file => {
  if (file.toLowerCase().endsWith('.webp')) {
    const outputName = file.replace(/\.webp$/i, '.png');
    
    sharp(path.join(inputFolder, file))
      .toFormat('png')
      .toFile(path.join(outputFolder, outputName))
      .then(() => console.log(`✅ Convertido: ${outputName}`))
      .catch(err => console.error(`❌ Error con ${file}:`, err));
  }
});

console.log('Procesando imágenes...');