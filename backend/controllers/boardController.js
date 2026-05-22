const Board = require('../models/Board');
const Column = require('../models/Column');
const Workspace = require('../models/Workspace');

// @desc    Create a Board in a Workspace
// @route   POST /api/boards
// @access  Private
exports.createBoard = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ success: false, message: 'Please provide board name and workspace id' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Check if user is a member of this workspace
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to create a board in this workspace' });
    }

    // Create the board
    const board = await Board.create({
      name,
      description,
      workspace: workspaceId,
    });

    // Premium SaaS feature: Auto-create default columns (Todo, In Progress, Review, Completed)
    const defaultColumnNames = ['Todo', 'In Progress', 'Review', 'Completed'];
    const columns = [];

    for (let i = 0; i < defaultColumnNames.length; i++) {
      const col = await Column.create({
        name: defaultColumnNames[i],
        board: board._id,
        position: i,
        tasks: [],
      });
      columns.push(col._id);
    }

    // Add columns to board
    board.columns = columns;
    await board.save();

    res.status(201).json({ success: true, board });
  } catch (error) {
    console.error('Create Board error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get boards for a workspace
// @route   GET /api/boards
// @access  Private
exports.getBoards = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Workspace ID required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const boards = await Board.find({ workspace: workspaceId });
    res.status(200).json({ success: true, boards });
  } catch (error) {
    console.error('Get Boards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get full board details populated with columns and tasks
// @route   GET /api/boards/:id
// @access  Private
exports.getBoardDetails = async (req, res) => {
  try {
    const boardId = req.params.id;

    const board = await Board.findById(boardId).populate({
      path: 'columns',
      options: { sort: { position: 1 } },
      populate: {
        path: 'tasks',
        options: { sort: { position: 1 } },
        populate: [
          { path: 'assignees', select: 'id username email avatarUrl' },
          { path: 'comments', populate: { path: 'author', select: 'username avatarUrl' } }
        ]
      },
    });

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace);
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this board' });
    }

    res.status(200).json({ success: true, board });
  } catch (error) {
    console.error('Get Board Details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
