const express = require('express');
const router = express.Router();
const { getSkills, getSkillById, createSkill } = require('../controllers/skillController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSkills);
router.get('/:id', getSkillById);

// Protected routes
router.post('/', authMiddleware, createSkill);

module.exports = router;
