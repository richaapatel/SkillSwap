const Skill = require('../models/Skill');
const mongoose = require('mongoose');

// @desc    Get all skills (with optional search and category filter)
// @route   GET /api/skills
const getSkills = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = new RegExp(req.query.category, 'i');
    }

    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }

    const skills = await Skill.find(filter);
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
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
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Create a new skill
// @route   POST /api/skills
const createSkill = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    // Check for duplicate skill (case-insensitive)
    const existingSkill = await Skill.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i'),
    });

    if (existingSkill) {
      return res.status(409).json({ message: 'A skill with this name already exists.' });
    }

    const skill = await Skill.create({ name, description, category });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getSkills, getSkillById, createSkill };
