const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  exportTransactions,
} = require('../controllers/transactionController');

router.use(protect);

router.route('/').get(getTransactions).post(createTransaction);
router.get('/summary', getMonthlySummary);
router.get('/export/csv', exportTransactions);
router.route('/:id').get(getTransactionById).put(updateTransaction).delete(deleteTransaction);

module.exports = router;
