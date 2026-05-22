const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/').get(getNotifications);
router.route('/:id/read').put(markAsRead);

module.exports = router;
