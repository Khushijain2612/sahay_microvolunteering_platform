// const User = require('../models/user');
// const jwt = require('jsonwebtoken');

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign(
//     { id }, 
//     "51e7772422fc2c3a81f7842348fdd136", // ← Use as string directly
//     {
//       expiresIn: '30d', // ← Hardcode expiry for now
//     }
//   );
// };
// // @desc    Register user
// // @route   POST /api/auth/register
// // @access  Public
// exports.register = async (req, res) => {
//   try {
//     console.log('📝 Registration request:', req.body);

//     const { name, email, password, role, phone } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this email'
//       });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password, // This should be hashed by pre-save hook
//       role: role || 'volunteer',
//       phone
//     });

//     console.log('✅ User created in DB:', user); // ← Check if user actually saved

//     // Verify the user exists in DB
//     const savedUser = await User.findById(user._id);
//     console.log('🔍 User retrieved from DB:', savedUser); // ← Confirm retrieval

//     // Create token
//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           role: user.role
//         },
//         token
//       }
//     });
//   } catch (error) {
//     console.error('❌ Registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error in registration',
//       error: error.message
//     });
//   }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// // In your backend login controller
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log('🔐 Login attempt:', { email, password: '***' }); // Hide actual password

//     // Check if user exists
//     const user = await User.findOne({ email }).select('+password');
//     console.log('👤 User found:', user ? user.email : 'NO USER FOUND');
    
//     if (!user) {
//       console.log('❌ No user found with email:', email);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     console.log('🔑 Stored hash:', user.password);
//     console.log('🔑 Comparing with entered password...');

//     // Check password
//     const isPasswordMatch = await user.matchPassword(password);
//     console.log('🔑 Password match result:', isPasswordMatch);

//     if (!isPasswordMatch) {
//       console.log('❌ Password does not match for:', email);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     console.log('✅ Login successful for:', email);

//     // Create token
//     const token = generateToken(user._id);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           role: user.role
//         },
//         token
//       }
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error in login',
//       error: error.message
//     });
//   }
// };

// // @desc    Get current user
// // @route   GET /api/auth/me
// // @access  Private
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     res.json({
//       success: true,
//       data: { user }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching user data',
//       error: error.message
//     });
//   }
// };


// // @desc    Update user profile
// // @route   PUT /api/auth/profile
// // @access  Private
// exports.updateProfile = async (req, res) => {
//   try {
//     const fieldsToUpdate = {
//       name: req.body.name,
//       phone: req.body.phone,
//       bio: req.body.bio,
//       skills: req.body.skills,
//       address: req.body.address
//     };

//     const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
//       new: true,
//       runValidators: true
//     });

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: { user }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating profile',
//       error: error.message
//     });
//   }
// };
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Add this

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    "51e7772422fc2c3a81f7842348fdd136",
    { expiresIn: '30d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('=== REGISTER START ===');
    console.log('📝 Registration request:', req.body);
    console.log('🗄️ Database state:', {
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host
    });

    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ email });
    console.log('👤 Existing user check:', existingUser ? 'FOUND' : 'NOT FOUND');
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    console.log('🔄 Creating user...');
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'volunteer',
      phone
    });

    console.log('✅ User created in DB:', user._id);

    // Verify the user exists in DB
    console.log('🔍 Verifying user retrieval...');
    const savedUser = await User.findById(user._id);
    console.log('✅ User retrieved from DB:', savedUser.email);

    // Create token
    const token = generateToken(user._id);

    console.log('🎉 Registration completed successfully');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 === LOGIN ATTEMPT START ===');
    console.log('📧 Email attempted:', email);
    console.log('🔑 Password attempted:', '***' + password.substring(password.length - 2)); // Show last 2 chars only

    // Check if user exists
    console.log('🔍 Searching for user in database...');
    const user = await User.findOne({ email }).select('+password');
    console.log('👤 User found:', user ? `YES (${user.email})` : 'NO');
    
    if (!user) {
      // Let's check what users actually exist
      const allUsers = await User.find({});
      console.log('📊 All users in database:', allUsers.map(u => u.email));
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('🔑 Comparing passwords...');
    console.log('🔑 Stored hash:', user.password.substring(0, 20) + '...');
    
    const isPasswordMatch = await user.matchPassword(password);
    console.log('🔑 Password match result:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Login successful!');
    
    // Create token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      skills: req.body.skills,
      address: req.body.address
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};