const express = require('express');
const router = express.Router();
const { createTask, updateTask, deleteTask, addComment } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/').post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.post('/:id/comments', addComment);

module.exports = router;
