const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  getDatabaseError,
  getPasswordValidationErrors,
  isNonEmptyString,
  isValidEmail,
} = require('../utils/validation');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const { name, email, password } = body;

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    if (name.trim().length > 80) {
      return res.status(400).json({ message: 'Name must be 80 characters or fewer.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const passwordErrors = getPasswordValidationErrors(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: `Password requirements not met: ${passwordErrors.join(' ')}`,
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const { email, password } = body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    const databaseError = getDatabaseError(error);
    return res.status(databaseError.status).json({ message: databaseError.message });
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { register, login, getMe };
