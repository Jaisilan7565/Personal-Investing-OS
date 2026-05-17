const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { sendSuccess, sendError } = require('../utils/apiResponse');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists by email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return sendError(res, { message: 'User with this email already exists', statusCode: 400 });
    }

    // Check if user already exists by username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return sendError(res, { message: 'Username is already taken', statusCode: 400 });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      sendSuccess(res, {
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id),
        }
      });
    } else {
      sendError(res, { message: 'Invalid user data', statusCode: 400 });
    }
  } catch (error) {
    console.error('Register error:', error.message);
    sendError(res, { message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      sendSuccess(res, {
        message: 'Login successful',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id),
        }
      });
    } else {
      sendError(res, { message: 'Invalid email or password', statusCode: 401 });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    sendError(res, { message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      sendSuccess(res, {
        message: 'User profile retrieved successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
        }
      });
    } else {
      sendError(res, { message: 'User not found', statusCode: 404 });
    }
  } catch (error) {
    console.error('Profile error:', error.message);
    sendError(res, { message: 'Server error retrieving profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
