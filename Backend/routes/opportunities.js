const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/oppurtunityController');
// const { validateOpportunity } = require('../middleware/validation');
const { isAuthenticated, isAdmin, isVolunteer } = require('../middleware/auth');

// @route   GET /api/opportunities
// @desc    Get all opportunities
// @access  Public
router.get('/', opportunityController.getOpportunities);

// @route   GET /api/opportunities/:id
// @desc    Get single opportunity
// @access  Public
router.post('/create', isAuthenticated, opportunityController.createOpportunity);


// @route   POST /api/opportunities
// @desc    Create new opportunity
// @access  Private/Admin
// router.post('/', isAuthenticated, isAdmin, validateOpportunity, opportunityController.createOpportunity);

// @route   POST /api/opportunities/:id/book
// @desc    Book an opportunity
// @access  Private/Volunteer
// router.post('/:id/book', isAuthenticated, isVolunteer, opportunityController.applyForOpportunity);

// @route   POST /api/opportunities/:id/cancel
// @desc    Cancel booking
// @access  Private/Volunteer
// router.post('/:id/cancel', isAuthenticated, isVolunteer, opportunityController.cancelBooking);

// @route   PUT /api/opportunities/:id
// @desc    Update opportunity
// @access  Private/Admin
// router.put('/:id', isAuthenticated, isAdmin, validateOpportunity, opportunityController.updateOpportunity);

// @route   DELETE /api/opportunities/:id
// @desc    Delete opportunity
// @access  Private/Admin
// router.delete('/:id', isAuthenticated, isAdmin, opportunityController.deleteOpportunity);
// In your opportunities routes file, add this temporary route:
router.get('/test', (req, res) => {
  res.json({
    success: true,
    data: {
      opportunities: [
        {
          _id: '1',
          title: 'Food Distribution Support',
          ngo_id: { name: 'City Food Bank', email: 'contact@foodbank.org' },
          description: 'Help distribute food packages to families in need',
          date: '2024-01-20T10:00:00.000Z',
          duration_hours: 2,
          location: { address: 'Downtown Center' },
          skillsRequired: ['Physical Work', 'Communication'],
          total_spots: 8,
          filled_spots: 3,
          status: 'active'
        }
      ],
      total: 1,
      totalPages: 1,
      currentPage: 1
    }
  });
});
module.exports = router;