const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  console.log('🛡️ === AUTH MIDDLEWARE TRIGGERED ===');
  console.log('🔍 Request URL:', req.originalUrl);
  console.log('🔍 Request Method:', req.method);
  console.log('🔍 Headers received:', {
    authorization: req.headers.authorization ? 'Present' : 'Missing',
    'content-type': req.headers['content-type']
  });

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token extracted from headers');
    console.log('🔐 Token (first 20 chars):', token.substring(0, 20) + '...');
  } else {
    console.log('❌ No Bearer token found in Authorization header');
    console.log('🔍 Full Authorization header:', req.headers.authorization);
  }

  if (!token) {
    console.log('🚫 BLOCKED: No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    console.log('🔐 Verifying token...');
    
    // Use the same secret as in generateToken
    const jwtSecret = process.env.JWT_SECRET || "51e7772422fc2c3a81f7842348fdd136";
    console.log('🔑 Using JWT secret:', jwtSecret ? 'Set' : 'Not set');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token verified successfully');
    console.log('👤 Decoded token data:', decoded);

    console.log('🔍 Finding user in database...');
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('❌ User not found in database for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User authenticated:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    console.error('🔍 Error details:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🎭 Role check - Required roles:', roles);
    console.log('🎭 User role:', req.user?.role);
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ Role access denied');
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    console.log('✅ Role access granted');
    next();
  };
};

// Check if user is a volunteer
exports.isVolunteer = (req, res, next) => {
  console.log('🔍 Checking volunteer role...');
  
  if (req.user && req.user.role === 'volunteer') {
    console.log('✅ Volunteer access granted');
    next();
  } else {
    console.log('❌ Volunteer access denied');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Volunteer role required.'
    });
  }
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  console.log('🔍 Checking admin role...');
  
  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

// Optional auth for public routes that might have user context
exports.optionalAuth = async (req, res, next) => {
  let token;

  console.log('🔍 Optional auth check...');
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🔐 Optional token found');
  } else {
    console.log('🔐 No token for optional auth');
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "51e7772422fc2c3a81f7842348fdd136");
      req.user = await User.findById(decoded.id);
      console.log('✅ Optional auth - User set:', req.user?.email);
    } catch (error) {
      console.log('⚠️ Optional auth: Invalid token - continuing without user');
    }
  }

  next();
};

// Alias for protect
exports.isAuthenticated = exports.protect;

// Add a debug route to test auth
exports.testAuth = async (req, res) => {
  console.log('🧪 Test auth route called');
  res.json({
    success: true,
    message: 'Auth test successful',
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
};