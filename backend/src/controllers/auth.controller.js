const {
  register, login, getMe, updateProfile, updateAvatar, changePassword, requestPasswordReset, resetPassword,
} = require('../services/auth.service');

const registerController = async (req, res, next) => {
  try { res.status(201).json({ data: await register(req.validatedAuth) }); }
  catch (error) { next(error); }
};

const loginController = async (req, res, next) => {
  try { res.json({ data: await login(req.validatedAuth) }); }
  catch (error) { next(error); }
};

const meController = async (req, res, next) => {
  try { res.json({ data: await getMe(req.user.id) }); }
  catch (error) { next(error); }
};

const updateProfileController = async (req, res, next) => {
  try { res.json({ data: await updateProfile(req.user.id, req.validatedProfile) }); }
  catch (error) { next(error); }
};

const uploadAvatarController = async (req, res, next) => {
  try { res.json({ data: await updateAvatar(req.user.id, req.file) }); }
  catch (error) { next(error); }
};

const changePasswordController = async (req, res, next) => {
  try {
    await changePassword(req.user.id, req.validatedPasswordChange);
    res.json({ data: { message: 'Senha atualizada com sucesso.' } });
  } catch (error) { next(error); }
};

const forgotPasswordController = async (req, res, next) => {
  try { res.json({ data: await requestPasswordReset(req.validatedForgotPassword) }); }
  catch (error) { next(error); }
};

const resetPasswordController = async (req, res, next) => {
  try {
    await resetPassword(req.validatedResetPassword);
    res.json({ data: { message: 'Senha redefinida com sucesso.' } });
  } catch (error) { next(error); }
};

module.exports = {
  register: registerController,
  login: loginController,
  me: meController,
  updateProfile: updateProfileController,
  uploadAvatar: uploadAvatarController,
  changePassword: changePasswordController,
  forgotPassword: forgotPasswordController,
  resetPassword: resetPasswordController,
};
