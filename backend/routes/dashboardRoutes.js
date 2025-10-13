const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardMetrics } = require('../controllers/dashboardController');

router.get('/', protect, getDashboardMetrics);

module.exports = router;
