const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');
const controller = require('../controllers/root-access.controller');

const router = Router();

router.get('/', controller.getPublic);
router.post('/request', requireAuth, controller.createRequest);
router.get('/admin/subscriptions', requireAuth, requireAdmin, controller.listAdmin);
router.patch('/admin/subscriptions/:id/status', requireAuth, requireAdmin, controller.updateStatus);

module.exports = router;
