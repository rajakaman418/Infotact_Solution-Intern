const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, controller.getDashboard);

module.exports = router;