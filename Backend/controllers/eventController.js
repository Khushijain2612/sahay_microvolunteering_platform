const EventBooking = require('../models/EventBooking');
const User = require('../models/user');
const VolunteerWork = require('../models/VolunteerWork');

// @desc    Create event booking
// @route   POST /api/events
// @access  Private (Organization/Admin)
exports.createEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventType,
      description,
      date,
      duration,
      location,
      volunteersRequired,
      skillsRequired,
      budget,
      specialRequirements,
      contactPerson
    } = req.body;

    const event = await EventBooking.create({
      eventName,
      organizer: req.user.id,
      eventType,
      description,
      date,
      duration,
      location,
      volunteersRequired,
      skillsRequired,
      budget,
      specialRequirements,
      contactPerson
    });

    await event.populate('organizer', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const {
      eventType,
      date,
      city,
      status,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    
    // Filter by date (events from today onwards)
    if (date === 'upcoming') {
      filter.date = { $gte: new Date() };
    }

    const events = await EventBooking.find(filter)
      .populate('organizer', 'name email avatar rating')
      .populate('assignedVolunteers.volunteer', 'name avatar rating skills')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EventBooking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        events,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await EventBooking.findById(req.params.id)
      .populate('organizer', 'name email phone avatar rating bio')
      .populate('assignedVolunteers.volunteer', 'name avatar rating skills bio totalHours completedTasks');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organization/Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await EventBooking.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event = await EventBooking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('organizer', 'name email avatar')
      .populate('assignedVolunteers.volunteer', 'name avatar rating');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// @desc    Assign volunteer to event
// @route   POST /api/events/:id/assign
// @access  Private (Organization/Admin)
exports.assignVolunteer = async (req, res) => {
  try {
    const { volunteerId, role } = req.body;
    
    const event = await EventBooking.findById(req.params.id);
    const volunteer = await User.findById(volunteerId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Check if volunteer is already assigned
    const alreadyAssigned = event.assignedVolunteers.find(
      assignment => assignment.volunteer.toString() === volunteerId
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer already assigned to this event'
      });
    }

    // Check if we have available slots
    if (event.assignedVolunteers.length >= event.volunteersRequired) {
      return res.status(400).json({
        success: false,
        message: 'No available volunteer slots remaining'
      });
    }

    // Assign volunteer
    event.assignedVolunteers.push({
      volunteer: volunteerId,
      role: role || 'General Volunteer',
      status: 'assigned'
    });

    // Update event status if this is the first assignment
    if (event.assignedVolunteers.length === 1) {
      event.status = 'assigned';
    }

    await event.save();

    // Create volunteer work record
    const volunteerWork = await VolunteerWork.create({
      volunteer: volunteerId,
      event: event._id,
      workType: 'event',
      title: `Event: ${event.eventName}`,
      description: event.description,
      status: 'assigned',
      skillsUsed: event.skillsRequired || []
    });

    await event.populate('assignedVolunteers.volunteer', 'name avatar rating skills');

    res.json({
      success: true,
      message: 'Volunteer assigned successfully',
      data: { 
        event,
        volunteerWork 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning volunteer',
      error: error.message
    });
  }
};

// @desc    Complete event assignment
// @route   PUT /api/events/:eventId/volunteers/:volunteerId/complete
// @access  Private (Organization/Admin)
exports.completeVolunteerAssignment = async (req, res) => {
  try {
    const { eventId, volunteerId } = req.params;
    const { rating, feedback } = req.body;

    const event = await EventBooking.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find the volunteer assignment
    const assignment = event.assignedVolunteers.find(
      a => a.volunteer.toString() === volunteerId
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer assignment not found'
      });
    }

    // Update assignment
    assignment.status = 'completed';
    assignment.rating = rating;
    assignment.feedback = feedback;
    assignment.completedAt = new Date();

    await event.save();

    // Update volunteer work record
    await VolunteerWork.findOneAndUpdate(
      { 
        event: eventId, 
        volunteer: volunteerId,
        workType: 'event'
      },
      {
        status: 'completed',
        ratingByOrganization: rating,
        feedbackByOrganization: feedback,
        dateCompleted: new Date()
      }
    );

    // Update volunteer's stats
    if (rating) {
      await updateVolunteerRating(volunteerId);
    }

    res.json({
      success: true,
      message: 'Volunteer assignment completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing assignment',
      error: error.message
    });
  }
};

// Helper function to update volunteer rating
const updateVolunteerRating = async (volunteerId) => {
  const volunteerWorks = await VolunteerWork.find({ 
    volunteer: volunteerId,
    ratingByOrganization: { $exists: true, $ne: null }
  });
  
  if (volunteerWorks.length > 0) {
    const totalRating = volunteerWorks.reduce((sum, work) => sum + work.ratingByOrganization, 0);
    const averageRating = totalRating / volunteerWorks.length;
    
    await User.findByIdAndUpdate(volunteerId, { 
      rating: Math.round(averageRating * 10) / 10 
    });
  }
};