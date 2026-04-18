const express = require('express');
const router = express.Router();

const controller = require('../controllers/invoice.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/:orderId/pdf', protect, controller.downloadInvoicePdf);
router.get('/:orderId', protect, controller.getInvoiceByOrderId);

module.exports = router;