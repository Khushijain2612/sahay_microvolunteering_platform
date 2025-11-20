const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes
router.get('/', eventController.getEvents);

// Protected routes
router.post('/events', isAuthenticated, eventController.createEvent);
router.get('/my-bookings', isAuthenticated, eventController.getUserEventBookings);
router.get('/:id', isAuthenticated, eventController.getEventBooking);
router.put('/:id', isAuthenticated, eventController.updateEventBooking);
router.delete('/:id', isAuthenticated, eventController.cancelEventBooking);
router.post('/:id/assign', isAuthenticated, eventController.assignVolunteer);
router.put('/:eventId/volunteers/:volunteerId/complete', isAuthenticated, eventController.completeVolunteerAssignment);

module.exports = router;