const User = require('../models/User');
const Skill = require('../models/Skill');
const mongoose = require('mongoose');

// @desc    Get authenticated user's profile
// @route   GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update authenticated user's profile
// @route   PUT /api/users/me
const updateMyProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get a user's public profile by ID
// @route   GET /api/users/:userId
const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const user = await User.findById(req.params.userId)
      .select('-password -email')
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Discover users with optional filters, search, and pagination
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const filter = {};

    // Exclude current user if authenticated
    if (req.user) {
      filter._id = { $ne: req.user._id };
    }

    // Search by name
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }

    // Filter by offered skill
    if (req.query.offeredSkill) {
      if (!mongoose.Types.ObjectId.isValid(req.query.offeredSkill)) {
        return res.status(400).json({ message: 'Invalid offeredSkill ID.' });
      }
      filter.skillsOffered = req.query.offeredSkill;
    }

    // Filter by wanted skill
    if (req.query.wantedSkill) {
      if (!mongoose.Types.ObjectId.isValid(req.query.wantedSkill)) {
        return res.status(400).json({ message: 'Invalid wantedSkill ID.' });
      }
      filter.skillsWanted = req.query.wantedSkill;
    }

    // Pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password -email')
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

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
  getMyProfile,
  updateMyProfile,
  getUserById,
  getUsers,
  getMySkills,
  addOfferedSkill,
  removeOfferedSkill,
  addWantedSkill,
  removeWantedSkill,
};

