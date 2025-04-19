const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, email and password',
        error: 'INVALID_INPUT'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email',
        error: 'USER_EXISTS'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    console.log(`✅ User registered successfully: ${email}`);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    
    // Check for MongoDB connection errors
    if (error.name === 'MongooseServerSelectionError' || 
        error.name === 'MongooseError' || 
        error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: 'DB_CONNECTION_ERROR'
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        error: 'VALIDATION_ERROR',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: 'SERVER_ERROR'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'ecocart-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    address: req.user.address
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    req.user.name = name;
    req.user.phone = phone;
    
    await req.user.save();
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country } = req.body;
    
    req.user.address = {
      street,
      city,
      state,
      zipCode,
      country
    };
    
    await req.user.save();
    
    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Address update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyToken = async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    }
  });
};
