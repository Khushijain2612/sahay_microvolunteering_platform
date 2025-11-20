const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { isAuthenticated, authorize } = require('../middleware/auth');

// @route   GET /api/volunteer/dashboard
// @desc    Get volunteer dashboard
// @access  Private/Volunteer
router.get('/dashboard', isAuthenticated, authorize('volunteer'), volunteerController.getDashboard);

// @route   GET /api/volunteer/applications
// @desc    Get volunteer's opportunity applications
// @access  Private/Volunteer
router.get('/applications', isAuthenticated, authorize('volunteer'), volunteerController.getMyApplications);

// @route   GET /api/volunteer/events
// @desc    Get volunteer's event assignments
// @access  Private/Volunteer
router.get('/events', isAuthenticated, authorize('volunteer'), volunteerController.getMyEvents);

// @route   PUT /api/volunteer/work/:id/status
// @desc    Update volunteer work status
// @access  Private/Volunteer
router.put('/work/:id/status', isAuthenticated, authorize('volunteer'), volunteerController.updateWorkStatus);

// @route   POST /api/volunteer/work/:id/proof
// @desc    Add proof of work
// @access  Private/Volunteer
router.post('/work/:id/proof', isAuthenticated, authorize('volunteer'), volunteerController.addWorkProof);

// @route   POST /api/volunteer/work/:id/rate
// @desc    Rate completed work
// @access  Private/Volunteer
router.post('/work/:id/rate', isAuthenticated, authorize('volunteer'), volunteerController.rateWork);

module.exports = router;