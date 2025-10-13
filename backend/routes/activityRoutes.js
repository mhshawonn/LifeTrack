const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');

router.use(protect);

router.route('/').get(activityController.getActivities).post(activityController.createActivity);
router
  .route('/:id')
  .get(activityController.getActivityById)
  .put(activityController.updateActivity)
  .delete(activityController.deleteActivity);
router.post('/:id/complete', activityController.markCompleted);

module.exports = router;
