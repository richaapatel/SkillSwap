const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getUserById,
  getUsers,
  getMySkills,
  addOfferedSkill,
  removeOfferedSkill,
  addWantedSkill,
  removeWantedSkill,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

// Public routes (with optional auth for user exclusion)
router.get('/', optionalAuth, getUsers);

// Authenticated /me routes (must be defined before /:userId)
router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);
router.get('/me/skills', authMiddleware, getMySkills);

router.post('/me/skills/offered/:skillId', authMiddleware, addOfferedSkill);
router.delete('/me/skills/offered/:skillId', authMiddleware, removeOfferedSkill);

router.post('/me/skills/wanted/:skillId', authMiddleware, addWantedSkill);
router.delete('/me/skills/wanted/:skillId', authMiddleware, removeWantedSkill);

// Public user profile by ID (must be after /me routes)
router.get('/:userId', getUserById);

module.exports = router;

