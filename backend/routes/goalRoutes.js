const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  recordProgress,
} = require('../controllers/goalController');

router.use(protect);

router.route('/').get(getGoals).post(createGoal);
router.route('/:id').get(getGoalById).put(updateGoal).delete(deleteGoal);
router.post('/:id/progress', recordProgress);

module.exports = router;
