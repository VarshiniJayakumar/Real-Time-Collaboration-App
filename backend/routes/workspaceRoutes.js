const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, inviteMember, getWorkspaceMembers } = require('../controllers/workspaceController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/').post(createWorkspace).get(getWorkspaces);
router.post('/:id/invite', inviteMember);
router.get('/:id/members', getWorkspaceMembers);

module.exports = router;
