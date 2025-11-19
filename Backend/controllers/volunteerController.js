const VolunteerWork = require('../models/VolunteerWork');
const Opportunity = require('../models/Opportunity');
const EventBooking = require('../models/EventBooking');
const User = require('../models/user');

// @desc    Get volunteer dashboard
// @route   GET /api/volunteer/dashboard
// @access  Private (Volunteer)
exports.getDashboard = async (req, res) => {
  try {
    const volunteerId = req.user.id;

    // Get volunteer stats
    const volunteer = await User.findById(volunteerId);
    
    // Get recent volunteer works
    const recentWorks = await VolunteerWork.find({ volunteer: volunteerId })
      .populate('opportunity', 'title category')
      .populate('event', 'eventName eventType')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get current assignments
    const currentWorks = await VolunteerWork.find({ 
      volunteer: volunteerId,
      status: { $in: ['assigned', 'in-progress'] }
    })
    .populate('opportunity', 'title category organization')
    .populate('event', 'eventName eventType date organizer')
    .populate('opportunity.organization', 'name avatar')
    .populate('event.organizer', 'name avatar');

    // Get upcoming events
    const upcomingEvents = await EventBooking.find({
      'assignedVolunteers.volunteer': volunteerId,
      'assignedVolunteers.status': { $in: ['assigned', 'confirmed'] },
      date: { $gte: new Date() }
    })
    .populate('organizer', 'name avatar')
    .sort({ date: 1 })
    .limit(5);

    // Get recommended opportunities based on skills
    const recommendedOpportunities = await Opportunity.find({
      status: 'active',
      skillsRequired: { $in: volunteer.skills || [] },
      'volunteersApplied.volunteer': { $ne: volunteerId }
    })
    .populate('organization', 'name avatar rating')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalHours: volunteer.totalHours,
          completedTasks: volunteer.completedTasks,
          rating: volunteer.rating,
          skills: volunteer.skills
        },
        recentWorks,
        currentAssignments: currentWorks,
        upcomingEvents,
        recommendedOpportunities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Get volunteer's opportunity applications
// @route   GET /api/volunteer/applications
// @access  Private (Volunteer)
exports.getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = { 
      'volunteersApplied.volunteer': req.user.id 
    };

    if (status) {
      filter['volunteersApplied.status'] = status;
    }

    const opportunities = await Opportunity.find(filter)
      .populate('organization', 'name avatar rating')
      .select('title category duration volunteersApplied status createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform data to show application-specific info
    const applications = opportunities.map(opp => {
      const application = opp.volunteersApplied.find(
        app => app.volunteer.toString() === req.user.id
      );
      
      return {
        _id: application._id,
        opportunity: {
          _id: opp._id,
          title: opp.title,
          category: opp.category,
          duration: opp.duration,
          status: opp.status
        },
        organization: opp.organization,
        appliedAt: application.appliedAt,
        status: application.status,
        rating: application.rating,
        feedback: application.feedback
      };
    });

    const total = await Opportunity.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Get volunteer's event assignments
// @route   GET /api/volunteer/events
// @access  Private (Volunteer)
exports.getMyEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = { 
      'assignedVolunteers.volunteer': req.user.id 
    };

    if (status) {
      filter['assignedVolunteers.status'] = status;
    }

    const events = await EventBooking.find(filter)
      .populate('organizer', 'name avatar rating')
      .select('eventName eventType date location assignedVolunteers status')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform data to show assignment-specific info
    const assignments = events.map(event => {
      const assignment = event.assignedVolunteers.find(
        assign => assign.volunteer.toString() === req.user.id
      );
      
      return {
        _id: assignment._id,
        event: {
          _id: event._id,
          eventName: event.eventName,
          eventType: event.eventType,
          date: event.date,
          location: event.location,
          status: event.status
        },
        organizer: event.organizer,
        assignedAt: assignment.assignedAt,
        role: assignment.role,
        status: assignment.status,
        rating: assignment.rating,
        feedback: assignment.feedback
      };
    });

    const total = await EventBooking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assignments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event assignments',
      error: error.message
    });
  }
};

// @desc    Update volunteer work status
// @route   PUT /api/volunteer/work/:id/status
// @access  Private (Volunteer)
exports.updateWorkStatus = async (req, res) => {
  try {
    const { status, hoursCompleted, impactMetrics } = req.body;
    
    const volunteerWork = await VolunteerWork.findById(req.params.id);

    if (!volunteerWork) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer work not found'
      });
    }

    // Check if volunteer owns this work
    if (volunteerWork.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this work'
      });
    }

    const updateData = { status };
    
    if (hoursCompleted) {
      updateData.hoursCompleted = hoursCompleted;
    }

    if (impactMetrics) {
      updateData.impactMetrics = {
        ...volunteerWork.impactMetrics,
        ...impactMetrics
      };
    }

    // If marking as completed, set completion date
    if (status === 'completed') {
      updateData.dateCompleted = new Date();
      
      // Update volunteer stats
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 
          totalHours: hoursCompleted || volunteerWork.hoursCompleted || 0,
          completedTasks: 1
        }
      });

      // Update opportunity/event status if needed
      if (volunteerWork.workType === 'opportunity' && volunteerWork.opportunity) {
        await Opportunity.findOneAndUpdate(
          { 
            _id: volunteerWork.opportunity,
            'volunteersApplied.volunteer': req.user.id
          },
          {
            $set: {
              'volunteersApplied.$.status': 'completed',
              'volunteersApplied.$.completedAt': new Date()
            }
          }
        );
      }
    }

    const updatedWork = await VolunteerWork.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('opportunity', 'title category')
    .populate('event', 'eventName eventType');

    res.json({
      success: true,
      message: 'Work status updated successfully',
      data: { volunteerWork: updatedWork }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating work status',
      error: error.message
    });
  }
};

// @desc    Add proof of work
// @route   POST /api/volunteer/work/:id/proof
// @access  Private (Volunteer)
exports.addWorkProof = async (req, res) => {
  try {
    const { proofUrls, description } = req.body;
    
    const volunteerWork = await VolunteerWork.findById(req.params.id);

    if (!volunteerWork) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer work not found'
      });
    }

    // Check if volunteer owns this work
    if (volunteerWork.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this work'
      });
    }

    // Add proof of work
    const updatedWork = await VolunteerWork.findByIdAndUpdate(
      req.params.id,
      {
        $push: { 
          proofOfWork: { $each: proofUrls } 
        },
        ...(description && { description })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Proof of work added successfully',
      data: { volunteerWork: updatedWork }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding proof of work',
      error: error.message
    });
  }
};

// @desc    Rate completed work
// @route   POST /api/volunteer/work/:id/rate
// @access  Private (Volunteer)
exports.rateWork = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const volunteerWork = await VolunteerWork.findById(req.params.id);

    if (!volunteerWork) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer work not found'
      });
    }

    // Check if volunteer owns this work and it's completed
    if (volunteerWork.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this work'
      });
    }

    if (volunteerWork.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed work'
      });
    }

    const updatedWork = await VolunteerWork.findByIdAndUpdate(
      req.params.id,
      {
        ratingByVolunteer: rating,
        feedbackByVolunteer: feedback
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Work rated successfully',
      data: { volunteerWork: updatedWork }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rating work',
      error: error.message
    });
  }
};