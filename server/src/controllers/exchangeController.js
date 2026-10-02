const Exchange = require('../models/Exchange');
const User = require('../models/User');
const Skill = require('../models/Skill');
const mongoose = require('mongoose');
const { getDatabaseError, isNonEmptyString } = require('../utils/validation');

// @desc    Create a new exchange request
// @route   POST /api/exchanges
const createExchange = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const { teacherId, skillId, message } = body;

    // Validate required fields
    if (!isNonEmptyString(teacherId) || !isNonEmptyString(skillId)) {
      return res.status(400).json({ message: 'teacherId and skillId are required.' });
    }

    if (message !== undefined && typeof message !== 'string') {
      return res.status(400).json({ message: 'Message must be text.' });
    }

    if (message && message.trim().length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer.' });
    }

    const normalizedTeacherId = teacherId.trim();
    const normalizedSkillId = skillId.trim();

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(normalizedTeacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID.' });
    }
    if (!mongoose.Types.ObjectId.isValid(normalizedSkillId)) {
      return res.status(400).json({ message: 'Invalid skill ID.' });
    }

    // Prevent self-request
    if (req.user._id.toString() === normalizedTeacherId) {
      return res.status(400).json({ message: 'You cannot send an exchange request to yourself.' });
    }

    // Verify teacher exists
    const teacher = await User.findById(normalizedTeacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    // Verify skill exists
    const skill = await Skill.findById(normalizedSkillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    // Verify teacher offers this skill
    const teacherOffersSkill = teacher.skillsOffered.some(
      (id) => id.toString() === normalizedSkillId
    );
    if (!teacherOffersSkill) {
      return res.status(400).json({ message: 'This teacher does not offer the requested skill.' });
    }

    // Check for duplicate pending request
    const existingExchange = await Exchange.findOne({
      learner: req.user._id,
      teacher: normalizedTeacherId,
      skill: normalizedSkillId,
      status: 'pending',
    });
    if (existingExchange) {
      return res.status(409).json({ message: 'You already have a pending request for this skill with this teacher.' });
    }

    // Create the exchange
    const exchange = await Exchange.create({
      learner: req.user._id,
      teacher: normalizedTeacherId,
      skill: normalizedSkillId,
      message: typeof message === 'string' ? message.trim() : undefined,
    });

    const populated = await Exchange.findById(exchange._id)
      .populate('teacher', 'name bio')
      .populate('learner', 'name bio')
      .populate('skill', 'name description category');

    res.status(201).json(populated);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Get exchanges sent by authenticated user
// @route   GET /api/exchanges/sent
const getSentExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({ learner: req.user._id })
      .populate('teacher', 'name bio')
      .populate('skill', 'name description category')
      .sort({ createdAt: -1 });

    res.status(200).json(exchanges);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Get exchanges received by authenticated user
// @route   GET /api/exchanges/received
const getReceivedExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({ teacher: req.user._id })
      .populate('learner', 'name bio')
      .populate('skill', 'name description category')
      .sort({ createdAt: -1 });

    res.status(200).json(exchanges);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Get a single exchange by ID
// @route   GET /api/exchanges/:exchangeId
const getExchangeById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.exchangeId)) {
      return res.status(400).json({ message: 'Invalid exchange ID.' });
    }

    const exchange = await Exchange.findById(req.params.exchangeId)
      .populate('teacher', 'name bio')
      .populate('learner', 'name bio')
      .populate('skill', 'name description category');

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found.' });
    }

    // Only participants can view
    const userId = req.user._id.toString();
    if (
      exchange.teacher._id.toString() !== userId &&
      exchange.learner._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'You are not authorized to view this exchange.' });
    }

    res.status(200).json(exchange);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Accept a pending exchange request
// @route   PATCH /api/exchanges/:exchangeId/accept
const acceptExchange = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.exchangeId)) {
      return res.status(400).json({ message: 'Invalid exchange ID.' });
    }

    const exchange = await Exchange.findById(req.params.exchangeId);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found.' });
    }

    // Only teacher can accept
    if (exchange.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the teacher can accept this request.' });
    }

    // Must be pending
    if (exchange.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept an exchange with status "${exchange.status}".` });
    }

    exchange.status = 'accepted';
    await exchange.save();

    const populated = await Exchange.findById(exchange._id)
      .populate('teacher', 'name bio')
      .populate('learner', 'name bio')
      .populate('skill', 'name description category');

    res.status(200).json(populated);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Reject a pending exchange request
// @route   PATCH /api/exchanges/:exchangeId/reject
const rejectExchange = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.exchangeId)) {
      return res.status(400).json({ message: 'Invalid exchange ID.' });
    }

    const exchange = await Exchange.findById(req.params.exchangeId);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found.' });
    }

    // Only teacher can reject
    if (exchange.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the teacher can reject this request.' });
    }

    // Must be pending
    if (exchange.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject an exchange with status "${exchange.status}".` });
    }

    exchange.status = 'rejected';
    await exchange.save();

    const populated = await Exchange.findById(exchange._id)
      .populate('teacher', 'name bio')
      .populate('learner', 'name bio')
      .populate('skill', 'name description category');

    res.status(200).json(populated);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Complete an accepted exchange
// @route   PATCH /api/exchanges/:exchangeId/complete
const completeExchange = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.exchangeId)) {
      return res.status(400).json({ message: 'Invalid exchange ID.' });
    }

    const exchange = await Exchange.findById(req.params.exchangeId);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found.' });
    }

    // Either participant can mark as complete
    const userId = req.user._id.toString();
    if (
      exchange.teacher.toString() !== userId &&
      exchange.learner.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Only participants can complete this exchange.' });
    }

    // Must be accepted
    if (exchange.status !== 'accepted') {
      return res.status(400).json({ message: `Cannot complete an exchange with status "${exchange.status}".` });
    }

    exchange.status = 'completed';
    await exchange.save();

    const populated = await Exchange.findById(exchange._id)
      .populate('teacher', 'name bio')
      .populate('learner', 'name bio')
      .populate('skill', 'name description category');

    res.status(200).json(populated);
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

module.exports = {
  createExchange,
  getSentExchanges,
  getReceivedExchanges,
  getExchangeById,
  acceptExchange,
  rejectExchange,
  completeExchange,
};
