const multer = require('multer');
const { HttpError } = require('../utils/http-error');

const notFound = (req, _res, next) => {
  next(new HttpError(404, 'Rota nǜo encontrada.'));
};

const errorHandler = (err, _req, res, _next) => {
  let status = err instanceof HttpError ? err.status : 500;
  let message = err.message;

  if (err instanceof multer.MulterError) {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'Imagem excede o limite de 5MB.';
    else if (err.code === 'LIMIT_FILE_COUNT') message = 'Máximo de 5 imagens por envio.';
    else message = 'Upload inválido.';
  }

  if (status >= 500) {
    console.error('[WIRED.exe] Erro interno:', err);
    message = 'Erro interno do servidor.';
  }

  const payload = { error: { message } };
  if (err.details && status < 500) payload.error.details = err.details;

  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
