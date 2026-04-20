const express = require('express');
const router = express.Router();
const controller = require('../controllers/store.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.post('/', protect, allowRoles('system_admin'), controller.createStore);
router.get('/', protect, controller.listStores);

module.exports = router;
