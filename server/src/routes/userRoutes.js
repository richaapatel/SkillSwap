const express = require('express');
const router = express.Router();
const {
  getMySkills,
  addOfferedSkill,
  removeOfferedSkill,
  addWantedSkill,
  removeWantedSkill,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All user skill routes require authentication
router.use(authMiddleware);

router.get('/me/skills', getMySkills);

router.post('/me/skills/offered/:skillId', addOfferedSkill);
router.delete('/me/skills/offered/:skillId', removeOfferedSkill);

router.post('/me/skills/wanted/:skillId', addWantedSkill);
router.delete('/me/skills/wanted/:skillId', removeWantedSkill);

module.exports = router;
