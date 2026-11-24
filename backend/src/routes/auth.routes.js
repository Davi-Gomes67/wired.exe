const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const {
  validateRegisterBody, validateLoginBody, validateProfileBody, validatePasswordChangeBody,
  validateForgotPasswordBody, validateResetPasswordBody,
} = require('../middlewares/validate.middleware');
const auth = require('../controllers/auth.controller');

const router = Router();

router.post('/register', validateRegisterBody, auth.register);
router.post('/login', validateLoginBody, auth.login);
router.post('/forgot-password', validateForgotPasswordBody, auth.forgotPassword);
router.post('/reset-password', validateResetPasswordBody, auth.resetPassword);
router.get('/me', requireAuth, auth.me);
router.patch('/me', requireAuth, validateProfileBody, auth.updateProfile);
router.patch('/me/password', requireAuth, validatePasswordChangeBody, auth.changePassword);

module.exports = router;
