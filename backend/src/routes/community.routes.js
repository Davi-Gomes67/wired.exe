const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
const { communityUpload } = require('../middlewares/upload.middleware');
const { validatePostBody, validateCommentBody, validateReportBody } = require('../middlewares/validate-community.middleware');
const controller = require('../controllers/community.controller');

const router = Router();
const createLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Muitas ações na comunidade. Tente novamente em alguns minutos.' } });
const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: 'Muitas denúncias enviadas. Tente novamente mais tarde.' } });

router.get('/posts', optionalAuthenticate, controller.list);
router.get('/posts/:slug', optionalAuthenticate, controller.getBySlug);
router.get('/posts/:slug/comments', optionalAuthenticate, controller.listComments);
router.get('/users/:username', optionalAuthenticate, controller.getProfile);
router.get('/saved/me', authenticate, controller.listSaved);

router.post('/posts', authenticate, createLimiter, communityUpload.array('images', 6), validatePostBody(false), controller.create);
router.patch('/posts/:slug', authenticate, createLimiter, communityUpload.array('images', 6), validatePostBody(true), controller.update);
router.delete('/posts/:slug', authenticate, controller.remove);
router.post('/posts/:slug/comments', authenticate, createLimiter, validateCommentBody, controller.addComment);
router.delete('/comments/:commentId', authenticate, controller.removeComment);
router.post('/posts/:slug/like', authenticate, controller.toggleLike);
router.post('/posts/:slug/save', authenticate, controller.toggleSave);
router.post('/reports', authenticate, reportLimiter, validateReportBody, controller.report);

module.exports = router;
