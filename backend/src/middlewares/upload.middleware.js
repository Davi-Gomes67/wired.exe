const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const { HttpError } = require('../utils/http-error');

const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads/products');
const AVATAR_DIR = path.resolve(__dirname, '../../../uploads/avatars');
const JOURNAL_DIR = path.resolve(__dirname, '../../../uploads/journal');
const COMMUNITY_DIR = path.resolve(__dirname, '../../../uploads/community');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(AVATAR_DIR, { recursive: true });
fs.mkdirSync(JOURNAL_DIR, { recursive: true });
fs.mkdirSync(COMMUNITY_DIR, { recursive: true });

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

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

const createStorage = (dir, prefix) => multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || '.jpg';
    cb(null, `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const imageFilter = (_req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) return cb(new HttpError(400, 'Tipo de imagem inválido. Use JPG, PNG, WEBP ou GIF.'));
  cb(null, true);
};

const validateImageFiles = (files = []) => {
  for (const file of files) {
    const ok = hasAllowedSignature(file.path, file.mimetype);
    if (!ok) {
      for (const f of files) try { fs.unlinkSync(f.path); } catch {}
      throw new HttpError(400, 'Arquivo de imagem inválido ou corrompido.');
    }
  }
};

const validateUploadedImages = (req, _res, next) => {
  try {
    const files = req.files || (req.file ?[req.file] : []);
    validateImageFiles(files);
    next();
  } catch (e) { next(e); }
};

const upload = multer({ storage: createStorage(UPLOAD_DIR, 'product'), limits: { fileSize: 5 * 1024 * 1024, files: 5 }, fileFilter: imageFilter });
const avatarUpload = multer({ storage: createStorage(AVATAR_DIR, 'avatar'), limits: { fileSize: 2 * 1024 * 1024, files: 1 }, fileFilter: imageFilter });
const journalUpload = multer({ storage: createStorage(JOURNAL_DIR, 'journal'), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: imageFilter });
const communityUpload = multer({ storage: createStorage(COMMUNITY_DIR, 'community'), limits: { fileSize: 5 * 1024 * 1024, files: 6 }, fileFilter: imageFilter });

module.exports = { upload, avatarUpload, journalUpload, communityUpload, UPLOAD_DIR, AVATAR_DIR, JOURNAL_DIR, COMMUNITY_DIR, validateUploadedImages, validateImageFiles };
