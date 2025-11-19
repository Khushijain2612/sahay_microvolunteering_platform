const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
exports.getOpportunities = async (req, res) => {
  try {
    const {
      category,
      location,
      isRemote,
      commitment,
      skills,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    let filter = { status: 'active' };
    
    if (category) filter.category = category;
    if (isRemote) filter.isRemote = isRemote === 'true';
    if (commitment) filter.commitment = commitment;
    if (skills) filter.skillsRequired = { $in: skills.split(',') };

    const opportunities = await Opportunity.find(filter)
      .populate('organization', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Opportunity.countDocuments(filter);

    res.json({
      success: true,
      data: {
        opportunities,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
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

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('organization', 'name email avatar bio rating')
      .populate('volunteersApplied.volunteer', 'name avatar rating');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      data: { opportunity }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunity',
      error: error.message
    });
  }
};

// @desc    Create opportunity
// @route   POST /api/opportunities
// @access  Private (Organization/Admin)
exports.createOpportunity = async (req, res) => {
  try {
    req.body.organization = req.user.id;
    
    const opportunity = await Opportunity.create(req.body);

    await opportunity.populate('organization', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: { opportunity }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating opportunity',
      error: error.message
    });
  }
};

// @desc    Apply for opportunity
// @route   POST /api/opportunities/:id/apply
// @access  Private (Volunteer)
exports.applyForOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if already applied
    const alreadyApplied = opportunity.volunteersApplied.find(
      application => application.volunteer.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'Already applied for this opportunity'
      });
    }

    // Add to applicants
    opportunity.volunteersApplied.push({
      volunteer: req.user.id,
      status: 'pending'
    });

    await opportunity.save();

    res.json({
      success: true,
      message: 'Applied for opportunity successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error applying for opportunity',
      error: error.message
    });
  }
};