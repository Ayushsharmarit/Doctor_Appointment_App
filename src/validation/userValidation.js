const { body, validationResult } = require('express-validator');

// Validation middleware for user signup
const validateSignup = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation middleware for user login
const validateLogin = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateUpdate = [
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail()
      .custom(async (email, { req }) => {
        // Check if the email is unique in the database, excluding the current user
        const user = await User.findOne({ email });
        if (user && user._id.toString() !== req.user._id) {
          return Promise.reject('Email already in use');
        }
        return true;
      }),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    // You can add more validation rules for other fields here
  ];
module.exports = { validateSignup, validateLogin, validateUpdate };
