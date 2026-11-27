const account = require('../services/account.service');
const { getUserAchievements } = require('../services/achievements.service');

const overview = async (req, res, next) => { try { res.json({ data: await account.getOverview(req.user.id) }); } catch (e) { next(e); } };
const rootAccess = async (req, res, next) => { try { res.json({ data: await account.getMyRootAccess(req.user.id) }); } catch (e) { next(e); } };
const achievements = async (req, res, next) => { try { res.json({ data: await getUserAchievements(req.user.id) }); } catch (e) { next(e); } };
const wishlist = async (req, res, next) => { try { res.json({ data: await account.getWishlist(req.user.id) }); } catch (e) { next(e); } };
const syncWishlist = async (req, res, next) => { try { res.json({ data: await account.syncWishlist(req.user.id, req.body?.productIds || []) }); } catch (e) { next(e); } };
const addWishlist = async (req, res, next) => { try { res.json({ data: await account.addWishlistItem(req.user.id, req.params.productId) }); } catch (e) { next(e); } };
const removeWishlist = async (req, res, next) => { try { res.json({ data: await account.removeWishlistItem(req.user.id, req.params.productId) }); } catch (e) { next(e); } };
const recentlyViewed = async (req, res, next) => { try { res.json({ data: await account.getRecentlyViewed(req.user.id) }); } catch (e) { next(e); } };
const addRecentlyViewed = async (req, res, next) => { try { res.json({ data: await account.addRecentlyViewed(req.user.id, req.body?.productId) }); } catch (e) { next(e); } };
const removeRecentlyViewed = async (req, res, next) => { try { res.json({ data: await account.removeRecentlyViewed(req.user.id, req.params.productId) }); } catch (e) { next(e); } };

module.exports = { overview, rootAccess, achievements, wishlist, syncWishlist, addWishlist, removeWishlist, recentlyViewed, addRecentlyViewed, removeRecentlyViewed };
