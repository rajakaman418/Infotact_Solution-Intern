const express = require('express');
const router = express.Router();
const controller = require('../controllers/tax.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.post('/', protect, allowRoles('system_admin'), controller.createTaxRule);
router.get('/', protect, controller.listTaxRules);

module.exports = router;
