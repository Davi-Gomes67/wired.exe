const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const account = require('../controllers/account.controller');

const router = Router();
router.use(requireAuth);
router.get('/overview', account.overview);
router.get('/root-access', account.rootAccess);
router.get('/achievements', account.achievements);
router.get('/wishlist', account.wishlist);
router.post('/wishlist/sync', account.syncWishlist);
router.post('/wishlist/:productId', account.addWishlist);
router.delete('/wishlist/:productId', account.removeWishlist);
router.get('/recently-viewed', account.recentlyViewed);
router.post('/recently-viewed', account.addRecentlyViewed);
router.delete('/recently-viewed/:productId', account.removeRecentlyViewed);

module.exports = router;
