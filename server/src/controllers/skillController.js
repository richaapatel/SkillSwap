const Skill = require('../models/Skill');
const mongoose = require('mongoose');
const {
  escapeRegex,
  getDatabaseError,
  isNonEmptyString,
} = require('../utils/validation');

// @desc    Get all skills (with optional search and category filter)
// @route   GET /api/skills
const getSkills = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category !== undefined) {
      if (!isNonEmptyString(req.query.category)) {
        return res.status(400).json({ message: 'Category must be a non-empty string.' });
      }
      filter.category = new RegExp(escapeRegex(req.query.category.trim()), 'i');
    }

    if (req.query.search !== undefined) {
      if (!isNonEmptyString(req.query.search)) {
        return res.status(400).json({ message: 'Search must be a non-empty string.' });
      }
      filter.name = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    }

    const skills = await Skill.find(filter);
    res.status(200).json(skills);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Get a single skill by ID
// @route   GET /api/skills/:id
const getSkillById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid skill ID.' });
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    res.status(200).json(skill);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Create a new skill
// @route   POST /api/skills
const createSkill = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const { name, description, category } = body;

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ message: 'Skill name must be 100 characters or fewer.' });
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ message: 'Skill description must be text.' });
    }

    if (category !== undefined && typeof category !== 'string') {
      return res.status(400).json({ message: 'Skill category must be text.' });
    }

    if (description && description.trim().length > 500) {
      return res.status(400).json({ message: 'Skill description must be 500 characters or fewer.' });
    }

    if (category && category.trim().length > 80) {
      return res.status(400).json({ message: 'Skill category must be 80 characters or fewer.' });
    }

    const normalizedName = name.trim();

    // Check for duplicate skill (case-insensitive)
    const existingSkill = await Skill.findOne({
      name: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i'),
    });

    if (existingSkill) {
      return res.status(409).json({ message: 'A skill with this name already exists.' });
    }

    const skill = await Skill.create({
      name: normalizedName,
      description: typeof description === 'string' ? description.trim() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
    });

    res.status(201).json(skill);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'A skill with this name already exists.' });
    }
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

module.exports = { getSkills, getSkillById, createSkill };
