const Task = require('../models/Task');
const Column = require('../models/Column');
const Board = require('../models/Board');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, labels, assignees, boardId, columnId } = req.body;

    if (!title || !boardId || !columnId) {
      return res.status(400).json({ success: false, message: 'Title, Board, and Column IDs are required' });
    }

    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }

    const taskCount = column.tasks.length;

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      labels: labels || [],
      assignees: assignees || [],
      board: boardId,
      column: columnId,
      position: taskCount,
    });

    column.tasks.push(task._id);
    await column.save();

    // Create activity log
    await Activity.create({
      actor: req.user.id,
      board: boardId,
      task: task._id,
      type: 'task_created',
      description: `created task "${title}"`,
    });

    const populatedTask = await Task.findById(task._id).populate('assignees', 'username email avatarUrl');

    res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    console.error('Create Task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a task (supports detail updates and reordering/moving)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updateData = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const originalColumnId = task.column.toString();
    const targetColumnId = updateData.column ? updateData.column.toString() : originalColumnId;

    // Check if task is moving to a different column or changing positions
    if (updateData.column && (originalColumnId !== targetColumnId || typeof updateData.position === 'number')) {
      const sourceCol = await Column.findById(originalColumnId);
      const destCol = await Column.findById(targetColumnId);

      if (!sourceCol || !destCol) {
        return res.status(404).json({ success: false, message: 'Columns not found' });
      }

      // If moving columns
      if (originalColumnId !== targetColumnId) {
        // Remove from original column
        sourceCol.tasks = sourceCol.tasks.filter((t) => t.toString() !== taskId);
        await sourceCol.save();

        // Add to new column at specific position
        const targetPos = typeof updateData.position === 'number' ? updateData.position : destCol.tasks.length;
        destCol.tasks.splice(targetPos, 0, taskId);
        await destCol.save();

        // Update positions inside destination column
        for (let i = 0; i < destCol.tasks.length; i++) {
          await Task.findByIdAndUpdate(destCol.tasks[i], { position: i });
        }
        // Update positions inside source column
        for (let i = 0; i < sourceCol.tasks.length; i++) {
          await Task.findByIdAndUpdate(sourceCol.tasks[i], { position: i });
        }

        task.column = targetColumnId;
        
        // Log movement activity
        await Activity.create({
          actor: req.user.id,
          board: task.board,
          task: task._id,
          type: 'task_moved',
          description: `moved "${task.title}" from "${sourceCol.name}" to "${destCol.name}"`,
        });
      } else {
        // Just reordering inside the same column
        sourceCol.tasks = sourceCol.tasks.filter((t) => t.toString() !== taskId);
        sourceCol.tasks.splice(updateData.position, 0, taskId);
        await sourceCol.save();

        for (let i = 0; i < sourceCol.tasks.length; i++) {
          await Task.findByIdAndUpdate(sourceCol.tasks[i], { position: i });
        }
      }
    }

    // Apply other updates
    const fieldsToUpdate = [
      'title',
      'description',
      'priority',
      'dueDate',
      'labels',
      'assignees',
    ];

    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        task[field] = updateData[field];
      }
    });

    await task.save();

    // Trigger Notification for assignees if newly assigned
    if (updateData.assignees && updateData.assignees.length > 0) {
      const newlyAssigned = updateData.assignees.filter((id) => !task.assignees.map(String).includes(id));
      for (const userId of newlyAssigned) {
        if (userId !== req.user.id) {
          await Notification.create({
            recipient: userId,
            sender: req.user.id,
            type: 'task_assigned',
            message: `assigned you to the task "${task.title}"`,
            board: task.board,
            task: task._id,
          });
        }
      }
    }

    const populatedTask = await Task.findById(taskId)
      .populate('assignees', 'username email avatarUrl')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username avatarUrl' },
      });

    res.status(200).json({ success: true, task: populatedTask });
  } catch (error) {
    console.error('Update Task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const column = await Column.findById(task.column);
    if (column) {
      column.tasks = column.tasks.filter((t) => t.toString() !== taskId);
      await column.save();
      
      // Update coordinates
      for (let i = 0; i < column.tasks.length; i++) {
        await Task.findByIdAndUpdate(column.tasks[i], { position: i });
      }
    }

    await Activity.create({
      actor: req.user.id,
      board: task.board,
      type: 'task_deleted',
      description: `deleted task "${task.title}"`,
    });

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ success: true, message: 'Task deleted successfully', taskId });
  } catch (error) {
    console.error('Delete Task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user.id,
      content,
    });

    task.comments.push(comment._id);
    await task.save();

    await Activity.create({
      actor: req.user.id,
      board: task.board,
      task: task._id,
      type: 'comment_added',
      description: `commented on task "${task.title}": "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
    });

    // Notify other assignees on this task
    for (const assigneeId of task.assignees) {
      if (assigneeId.toString() !== req.user.id) {
        await Notification.create({
          recipient: assigneeId,
          sender: req.user.id,
          type: 'comment_mention',
          message: `commented on task "${task.title}": "${content.substring(0, 40)}"`,
          board: task.board,
          task: task._id,
        });
      }
    }

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatarUrl');

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    console.error('Add Comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get activity logs for a Board
// @route   GET /api/boards/:id/activities
// @access  Private
exports.getBoardActivities = async (req, res) => {
  try {
    const boardId = req.params.id;
    const activities = await Activity.find({ board: boardId })
      .populate('actor', 'username avatarUrl')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.error('Get Board Activities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
