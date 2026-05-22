const express = require('express');
const router = express.Router();
const { createBoard, getBoards, getBoardDetails } = require('../controllers/boardController');
const { getBoardActivities } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/').post(createBoard).get(getBoards);
router.get('/:id', getBoardDetails);
router.get('/:id/activities', getBoardActivities);

module.exports = router;
