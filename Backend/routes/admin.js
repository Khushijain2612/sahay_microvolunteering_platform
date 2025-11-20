const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { protect, authorize } = require('../middleware/auth');
// @route   GET /api/admin/users
// @desc    Get all users with filtering
// @access  Private/Admin
router.get('/users', isAuthenticated, isAdmin, adminController.getUsers);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private/Admin
router.put('/users/:id/status', isAuthenticated, isAdmin, adminController.updateUserStatus);
router.put('/:id', protect, authorize('admin', 'ngo_admin'), updateOpportunity);

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private/Admin
router.get('/stats', isAuthenticated, isAdmin, adminController.getStatistics);

// @route   GET /api/admin/opportunities/review
// @desc    Get opportunities for review
// @access  Private/Admin
router.get('/opportunities/review', isAuthenticated, isAdmin, adminController.getOpportunitiesForReview);

// @route   PUT /api/admin/opportunities/:id/review
// @desc    Approve or reject opportunity
// @access  Private/Admin
router.put('/opportunities/:id/review', isAuthenticated, isAdmin, adminController.reviewOpportunity);

// @route   GET /api/admin/analytics
// @desc    Get system analytics
// @access  Private/Admin
router.get('/analytics', isAuthenticated, isAdmin, adminController.getAnalytics);

module.exports = router;