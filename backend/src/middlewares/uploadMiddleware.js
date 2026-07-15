const multer = require('multer');

// Guardamos en memoria temporalmente; sharp procesa el buffer antes de escribir a disco
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes JPEG, PNG o WEBP'));
    }
    cb(null, true);
  },
});

module.exports = { upload };