const Workspace = require('../models/Workspace');
const User = require('../models/User');

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a workspace name' });
    }

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({ success: true, workspace });
  } catch (error) {
    console.error('Create Workspace error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workspaces for current user
// @route   GET /api/workspaces
// @access  Private
exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      members: req.user.id,
    })
      .populate('owner', 'username email avatarUrl')
      .populate('members', 'username email avatarUrl');

    res.status(200).json({ success: true, workspaces });
  } catch (error) {
    console.error('Get Workspaces error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite member to workspace
// @route   POST /api/workspaces/:id/invite
// @access  Private
exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const workspaceId = req.params.id;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Check if the user is owner/member of the workspace
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to invite to this workspace' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ success: false, message: 'User with this email not found' });
    }

    // Check if user is already a member
    if (workspace.members.includes(userToInvite._id)) {
      return res.status(400).json({ success: false, message: 'User is already a member of this workspace' });
    }

    workspace.members.push(userToInvite._id);
    await workspace.save();

    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate('owner', 'username email avatarUrl')
      .populate('members', 'username email avatarUrl');

    res.status(200).json({ success: true, workspace: updatedWorkspace, message: 'Member invited successfully' });
  } catch (error) {
    console.error('Invite Member error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get members of a workspace
// @route   GET /api/workspaces/:id/members
// @access  Private
exports.getWorkspaceMembers = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate('members', 'username email avatarUrl');
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (!workspace.members.some((member) => member._id.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this workspace' });
    }

    res.status(200).json({ success: true, members: workspace.members });
  } catch (error) {
    console.error('Get Workspace Members error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
