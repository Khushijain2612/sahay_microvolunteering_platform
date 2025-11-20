const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Apply protect and authorize to all admin routes
router.use(protect); // All routes require authentication
router.use(authorize('admin')); // All routes require admin role

// Now all routes are protected and admin-only
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/stats', adminController.getStatistics);
router.get('/opportunities/review', adminController.getOpportunitiesForReview);
router.put('/opportunities/:id/review', adminController.reviewOpportunity);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;