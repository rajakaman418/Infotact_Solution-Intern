const express = require('express');
const router = express.Router();
const controller = require('../controllers/promotion.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.post('/', protect, allowRoles('system_admin'), controller.createPromotion);
router.get('/', protect, controller.listPromotions);

module.exports = router;
