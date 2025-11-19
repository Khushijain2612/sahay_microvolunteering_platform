const { validationResult } = require('express-validator');

// Check validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
exports.authValidation = {
  register: [
    // Add your validation rules here using express-validator
  ],
  login: [
    // Add your validation rules here
  ]
};

exports.opportunityValidation = {
  create: [
    // Add validation rules for opportunity creation
  ]
};