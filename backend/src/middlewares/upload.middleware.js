const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const { HttpError } = require('../utils/http-error');

const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads/products');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || '.jpg';
    cb(null, `product-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const hasAllowedSignature = (filePath, mime) => {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    const bytes = fs.readSync(fd, buf, 0, 12, 0);
    if (bytes < 3) return false;
    if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (mime === 'image/png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    if (mime === 'image/gif') return buf.toString('ascii', 0, 3) === 'GIF';
    if (mime === 'image/webp') return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    return false;
  } finally {
    fs.closeSync(fd);
  }
};

const validateUploadedImages = (req, _res, next) => {
  const files = req.files || [];
  for (const file of files) {
    const ok = hasAllowedSignature(file.path, file.mimetype);
    if (!ok) {
      for (const f of files) try { fs.unlinkSync(f.path); } catch {}
      return next(new HttpError(400, 'Arquivo de imagem inválido ou corrompido.'));
    }
  }
  next();
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) return cb(new HttpError(400, 'Tipo de imagem inválido. Use JPG, PNG, WEBP ou GIF.'));
    cb(null, true);
  },
});

module.exports = { upload, UPLOAD_DIR, validateUploadedImages };
