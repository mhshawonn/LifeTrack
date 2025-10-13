const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updatePreferences,
  logoutUser,
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getCurrentUser);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
