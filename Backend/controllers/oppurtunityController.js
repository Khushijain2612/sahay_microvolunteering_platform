const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
exports.getOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ status: 'active' })
      .populate('ngo_id', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        opportunities,
        total: opportunities.length,
        totalPages: 1,
        currentPage: 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunities',
      error: error.message
    });
  }
};
// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private/NGO
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skillsRequired,
      location,
      startDate,
      endDate,
      applicationDeadline,
      maxVolunteers,
      timeCommitment,
      responsibilities,
      benefits
    } = req.body;

    // Basic validation
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location are required'
      });
    }

    // Create opportunity object
    const opportunityData = {
      title,
      description,
      category,
      location,
      ngo_id: req.user.id, // Assuming NGO is authenticated and user ID is set in req.user
      status: 'pending' // Set to pending for admin approval
    };

    // Add optional fields if provided
    if (skillsRequired) opportunityData.skillsRequired = skillsRequired;
    if (startDate) opportunityData.startDate = startDate;
    if (endDate) opportunityData.endDate = endDate;
    if (applicationDeadline) opportunityData.applicationDeadline = applicationDeadline;
    if (maxVolunteers) opportunityData.maxVolunteers = maxVolunteers;
    if (timeCommitment) opportunityData.timeCommitment = timeCommitment;
    if (responsibilities) opportunityData.responsibilities = responsibilities;
    if (benefits) opportunityData.benefits = benefits;

    const opportunity = await Opportunity.create(opportunityData);

    // Populate NGO details in response
    await opportunity.populate('ngo_id', 'name email');

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully and submitted for approval',
      data: opportunity
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating opportunity',
      error: error.message
    });
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('ngo_id', 'name email');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunity',
      error: error.message
    });
  }
};

// Remove or comment out createOpportunity and applyForOpportunity for now
// since they require authentication and more complex logic