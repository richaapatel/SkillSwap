const User = require('../models/User');
const Skill = require('../models/Skill');
const mongoose = require('mongoose');

// @desc    Get authenticated user's offered and wanted skills
// @route   GET /api/users/me/skills
const getMySkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    res.status(200).json({
      offered: user.skillsOffered,
      wanted: user.skillsWanted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Add a skill to offered skills
// @route   POST /api/users/me/skills/offered/:skillId
const addOfferedSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID.' });
    }

    const skill = await Skill.findById(req.params.skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    const user = await User.findById(req.user._id);

    if (user.skillsOffered.includes(req.params.skillId)) {
      return res.status(409).json({ message: 'Skill already in your offered list.' });
    }

    user.skillsOffered.push(req.params.skillId);
    await user.save();

    await user.populate('skillsOffered', 'name description category');

    res.status(200).json({
      message: 'Skill added to offered list.',
      offered: user.skillsOffered,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Remove a skill from offered skills
// @route   DELETE /api/users/me/skills/offered/:skillId
const removeOfferedSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID.' });
    }

    const user = await User.findById(req.user._id);

    if (!user.skillsOffered.includes(req.params.skillId)) {
      return res.status(404).json({ message: 'Skill not found in your offered list.' });
    }

    user.skillsOffered = user.skillsOffered.filter(
      (id) => id.toString() !== req.params.skillId
    );
    await user.save();

    await user.populate('skillsOffered', 'name description category');

    res.status(200).json({
      message: 'Skill removed from offered list.',
      offered: user.skillsOffered,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Add a skill to wanted skills
// @route   POST /api/users/me/skills/wanted/:skillId
const addWantedSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID.' });
    }

    const skill = await Skill.findById(req.params.skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    const user = await User.findById(req.user._id);

    if (user.skillsWanted.includes(req.params.skillId)) {
      return res.status(409).json({ message: 'Skill already in your wanted list.' });
    }

    user.skillsWanted.push(req.params.skillId);
    await user.save();

    await user.populate('skillsWanted', 'name description category');

    res.status(200).json({
      message: 'Skill added to wanted list.',
      wanted: user.skillsWanted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Remove a skill from wanted skills
// @route   DELETE /api/users/me/skills/wanted/:skillId
const removeWantedSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID.' });
    }

    const user = await User.findById(req.user._id);

    if (!user.skillsWanted.includes(req.params.skillId)) {
      return res.status(404).json({ message: 'Skill not found in your wanted list.' });
    }

    user.skillsWanted = user.skillsWanted.filter(
      (id) => id.toString() !== req.params.skillId
    );
    await user.save();

    await user.populate('skillsWanted', 'name description category');

    res.status(200).json({
      message: 'Skill removed from wanted list.',
      wanted: user.skillsWanted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getMySkills,
  addOfferedSkill,
  removeOfferedSkill,
  addWantedSkill,
  removeWantedSkill,
};
