const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { categorizeExpense } = require('../controllers/aiController');

router.post('/categorize', protect, categorizeExpense);

module.exports = router;
