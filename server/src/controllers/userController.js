const User = require('../models/User');
const Skill = require('../models/Skill');
const mongoose = require('mongoose');
const {
  escapeRegex,
  getDatabaseError,
  isNonEmptyString,
  parsePagination,
} = require('../utils/validation');

// @desc    Get authenticated user's profile
// @route   GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Update authenticated user's profile
// @route   PUT /api/users/me
const updateMyProfile = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const { name, bio } = body;

    const updateFields = {};
    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        return res.status(400).json({ message: 'Name cannot be empty.' });
      }
      if (name.trim().length > 80) {
        return res.status(400).json({ message: 'Name must be 80 characters or fewer.' });
      }
      updateFields.name = name.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return res.status(400).json({ message: 'Bio must be text.' });
      }
      if (bio.trim().length > 500) {
        return res.status(400).json({ message: 'Bio must be 500 characters or fewer.' });
      }
      updateFields.bio = bio.trim();
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Provide a name or bio to update.' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
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
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
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
    if (req.query.search !== undefined) {
      if (!isNonEmptyString(req.query.search)) {
        return res.status(400).json({ message: 'Search must be a non-empty string.' });
      }
      filter.name = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    }

    // Filter by offered skill
    if (req.query.offeredSkill !== undefined) {
      if (!isNonEmptyString(req.query.offeredSkill)) {
        return res.status(400).json({ message: 'Invalid offeredSkill ID.' });
      }
      if (!mongoose.Types.ObjectId.isValid(req.query.offeredSkill)) {
        return res.status(400).json({ message: 'Invalid offeredSkill ID.' });
      }
      filter.skillsOffered = req.query.offeredSkill;
    }

    // Filter by wanted skill
    if (req.query.wantedSkill !== undefined) {
      if (!isNonEmptyString(req.query.wantedSkill)) {
        return res.status(400).json({ message: 'Invalid wantedSkill ID.' });
      }
      if (!mongoose.Types.ObjectId.isValid(req.query.wantedSkill)) {
        return res.status(400).json({ message: 'Invalid wantedSkill ID.' });
      }
      filter.skillsWanted = req.query.wantedSkill;
    }

    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }
    const { page, limit } = pagination;
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
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Get authenticated user's offered and wanted skills
// @route   GET /api/users/me/skills
const getMySkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      offered: user.skillsOffered,
      wanted: user.skillsWanted,
    });
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
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

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.skillsOffered.some((id) => id.toString() === req.params.skillId)) {
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
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
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

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

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
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
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

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.skillsWanted.some((id) => id.toString() === req.params.skillId)) {
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
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
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

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

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
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
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
