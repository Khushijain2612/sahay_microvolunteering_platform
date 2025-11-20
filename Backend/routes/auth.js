// const express = require("express");
// const router = express.Router();
// const { isAuthenticated } = require('../middleware/auth');
// const AuthController = require("../controllers/authController");
// const { testAuth } = require('../middleware/auth');

// router.post("/login", AuthController.login);
// router.post("/register", AuthController.register);
// router.get('/me', isAuthenticated, AuthController.getMe);
// router.get('/test', protect, testAuth);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { protect, authorize, isAuthenticated, testAuth } = require('../middleware/auth'); // Add testAuth
const AuthController = require("../controllers/authController");

// Public routes
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);

// ✅ ADD THIS TEST ROUTE
router.get("/test", protect, testAuth);

// Protected routes
router.get('/me', isAuthenticated, AuthController.getMe);

module.exports = router;