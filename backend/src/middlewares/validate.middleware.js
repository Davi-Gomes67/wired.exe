const { HttpError } = require('../utils/http-error');
const { normalizeEmail } = require('../utils/auth');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9()+\-\s]{8,20}$/;
const POSTAL_PATTERN = /^[0-9]{5}-?[0-9]{3}$/;
const STATE_PATTERN = /^[A-Z]{2}$/;
const PASSWORD_MIN = 8;
const PAYMENT_METHODS = new Set(['PIX_SIMULADO', 'BOLETO_SIMULADO', 'CARTAO_ENTREGA_SIMULADO']);

const readString = (value, field, min, max, { optional = false, pattern, patternMessage } = {}) => {
  if ((value === undefined || value === null || value === '') && optional) return null;
  if (typeof value !== 'string') throw new HttpError(400, `O campo ${field} deve ser um texto.`);
  const trimmed = value.trim();
  if (!trimmed && optional) return null;
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpError(400, `O campo ${field} deve ter entre ${min} e ${max} caracteres.`);
  }
  if (pattern && !pattern.test(trimmed)) {
    throw new HttpError(400, patternMessage || `O campo ${field} é inválido.`);
  }
  return trimmed;
};

const readEmail = (value, field = 'email') => {
  const email = normalizeEmail(readString(value, field, 5, 180));
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Informe um e-mail válido.');
  return email;
};

const readPassword = (value, field = 'password') => {
  if (typeof value !== 'string' || value.length < PASSWORD_MIN || value.length > 72) {
    throw new HttpError(400, `O campo ${field} deve ter entre ${PASSWORD_MIN} e 72 caracteres.`);
  }
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    throw new HttpError(400, `O campo ${field} deve conter letra e número.`);
  }
  return value;
};

const readPhone = (value, field = 'phone', optional = true) =>
  readString(value, field, 8, 20, {
    optional,
    pattern: PHONE_PATTERN,
    patternMessage: 'Informe um telefone válido.',
  });

const readAddress = (body, { partial = false } = {}) => {
  const get = (key) => body[key];
  const has = (key) => body[key] !== undefined;
  const address = {};

  const assign = (key, reader) => {
    if (partial && !has(key)) return;
    address[key] = reader(get(key));
  };

  assign('label', (v) => readString(v, 'label', 0, 60, { optional: true }));
  assign('recipientName', (v) => readString(v, 'recipientName', 2, 120));
  assign('phone', (v) => readPhone(v, 'phone', true));
  assign('postalCode', (v) => {
    const raw = readString(v, 'postalCode', 8, 9, { pattern: POSTAL_PATTERN, patternMessage: 'Informe um CEP válido.' });
    return raw.replace(/\D/g, '');
  });
  assign('addressLine1', (v) => readString(v, 'addressLine1', 4, 160));
  assign('addressLine2', (v) => readString(v, 'addressLine2', 0, 120, { optional: true }));
  assign('district', (v) => readString(v, 'district', 2, 100));
  assign('city', (v) => readString(v, 'city', 2, 100));
  assign('state', (v) => {
    const state = readString(v, 'state', 2, 2).toUpperCase();
    if (!STATE_PATTERN.test(state)) throw new HttpError(400, 'Informe uma UF válida (ex.: SP).');
    return state;
  });
  if (!partial || has('isDefault')) {
    const raw = get('isDefault');
    if (raw === undefined || raw === null) address.isDefault = partial ? undefined : false;
    else if (typeof raw === 'boolean') address.isDefault = raw;
    else throw new HttpError(400, 'O campo isDefault deve ser booleano.');
  }

  if (!partial) {
    const required = ['recipientName', 'postalCode', 'addressLine1', 'district', 'city', 'state'];
    for (const key of required) if (address[key] === undefined) throw new HttpError(400, `O campo ${key} é obrigatório.`);
  }
  return address;
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new HttpError(400, 'O pedido deve conter entre 1 e 50 itens.');
  }
  const merged = new Map();
  for (const item of items) {
    const productId = Number(item && item.productId);
    const quantity = Number(item && item.quantity);
    if (!Number.isInteger(productId) || productId <= 0) throw new HttpError(400, 'Cada item deve informar um productId válido.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new HttpError(400, 'A quantidade de cada item deve estar entre 1 e 99.');
    merged.set(productId, (merged.get(productId) || 0) + quantity);
    if (merged.get(productId) > 99) throw new HttpError(400, 'A quantidade máxima por produto é 99.');
  }
  return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
};

const validateRegisterBody = (req, _res, next) => {
  try {
    const body = req.body || {};
    req.validatedAuth = {
      name: readString(body.name, 'name', 2, 120),
      email: readEmail(body.email),
      password: readPassword(body.password),
      phone: readPhone(body.phone, 'phone', true),
    };
    next();
  } catch (error) { next(error); }
};

const validateLoginBody = (req, _res, next) => {
  try {
    const body = req.body || {};
    req.validatedAuth = {
      email: readEmail(body.email),
      password: readString(body.password, 'password', 1, 72),
    };
    next();
  } catch (error) { next(error); }
};

const validateProfileBody = (req, _res, next) => {
  try {
    const body = req.body || {};
    const data = {};
    if (body.name !== undefined) data.name = readString(body.name, 'name', 2, 120);
    if (body.phone !== undefined) data.phone = readPhone(body.phone, 'phone', true);
    if (Object.keys(data).length === 0) throw new HttpError(400, 'Informe ao menos um campo para atualizar.');
    req.validatedProfile = data;
    next();
  } catch (error) { next(error); }
};

const validatePasswordChangeBody = (req, _res, next) => {
  try {
    const body = req.body || {};
    req.validatedPasswordChange = {
      currentPassword: readString(body.currentPassword, 'currentPassword', 1, 72),
      newPassword: readPassword(body.newPassword, 'newPassword'),
    };
    next();
  } catch (error) { next(error); }
};

const validateForgotPasswordBody = (req, _res, next) => {
  try {
    req.validatedForgotPassword = { email: readEmail((req.body || {}).email) };
    next();
  } catch (error) { next(error); }
};

const validateResetPasswordBody = (req, _res, next) => {
  try {
    const body = req.body || {};
    req.validatedResetPassword = {
      token: readString(body.token, 'token', 20, 200),
      password: readPassword(body.password, 'password'),
    };
    next();
  } catch (error) { next(error); }
};

const validateAddressBody = (partial = false) => (req, _res, next) => {
  try {
    req.validatedAddress = readAddress(req.body || {}, { partial });
    if (partial && Object.keys(req.validatedAddress).length === 0) {
      throw new HttpError(400, 'Informe ao menos um campo para atualizar.');
    }
    next();
  } catch (error) { next(error); }
};

const validateCartBody = (req, _res, next) => {
  try {
    req.validatedCart = { items: normalizeItems((req.body || {}).items) };
    next();
  } catch (error) { next(error); }
};

const validateOrderBody = (req, _res, next) => {
  try {
    const body = req.body || {};
    const customerPhone = readPhone(body.customerPhone, 'customerPhone', true);
    const addressLine1 = readString(body.addressLine1, 'addressLine1', 4, 160);
    const addressLine2 = readString(body.addressLine2, 'addressLine2', 0, 120, { optional: true });
    const district = readString(body.district, 'district', 2, 100);
    const city = readString(body.city, 'city', 2, 100);
    const state = readString(body.state, 'state', 2, 2).toUpperCase();
    if (!STATE_PATTERN.test(state)) throw new HttpError(400, 'Informe uma UF válida (ex.: SP).');
    const postalCode = readString(body.postalCode, 'postalCode', 8, 9, {
      pattern: POSTAL_PATTERN,
      patternMessage: 'Informe um CEP válido.',
    }).replace(/\D/g, '');
    const paymentMethod = readString(body.paymentMethod, 'paymentMethod', 3, 40).toUpperCase();
    if (!PAYMENT_METHODS.has(paymentMethod)) throw new HttpError(400, 'Método de pagamento inválido.');

    req.validatedOrder = {
      customerPhone,
      addressLine1,
      addressLine2,
      district,
      city,
      state,
      postalCode,
      paymentMethod,
      paymentStatus: 'NOT_PROCESSED',
      items: normalizeItems(body.items),
    };
    next();
  } catch (error) { next(error); }
};

module.exports = {
  validateRegisterBody,
  validateLoginBody,
  validateProfileBody,
  validatePasswordChangeBody,
  validateForgotPasswordBody,
  validateResetPasswordBody,
  validateAddressBody,
  validateCartBody,
  validateOrderBody,
  PAYMENT_METHODS,
};
