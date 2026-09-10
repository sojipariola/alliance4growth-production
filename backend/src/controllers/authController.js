const User = require('../models/User');
const { generateToken } = require('../config/jwt');

const register = async (req, res) => {
  try {
    console.log('📝 Registration request received');
    console.log('📋 Request body:', { ...req.body, password: '***' });
    
    const { 
      first_name, 
      surname, 
      email, 
      phone, 
      address, 
      date_of_birth, 
      emergency_contact, 
      interests, 
      how_heard, 
      password 
    } = req.body;

    // Validate required fields
    if (!first_name || !surname || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'First name, surname, email and password are required' 
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const userData = {
      first_name,
      surname,
      email,
      phone: phone || null,
      address: address || null,
      date_of_birth: date_of_birth || null,
      emergency_contact: emergency_contact || null,
      interests: interests || [],
      how_heard: how_heard || null,
      password,
      role: 'member'
    };

    console.log('📝 Creating user with data:', { ...userData, password: '***' });
    
    const user = await User.create(userData);
    
    if (!user) {
      console.error('❌ Failed to create user - returned null');
      return res.status(500).json({ error: 'Failed to create user - database returned null' });
    }

    console.log('✅ User created successfully:', user.id);
    
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.surname}`,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await User.comparePassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_approved) {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }

    const token = generateToken(user.id);
    await User.updateLastLogin(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.surname}`,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.update(req.user.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
