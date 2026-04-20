const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.get('/', protect, controller.listProducts);
router.get('/:id', protect, controller.getProductById);
router.post('/', protect, allowRoles('system_admin', 'inventory_manager'), controller.createProduct);
router.put('/:id', protect, allowRoles('system_admin', 'inventory_manager'), controller.updateProduct);
router.delete('/:id', protect, allowRoles('system_admin'), controller.deleteProduct);

module.exports = router;
