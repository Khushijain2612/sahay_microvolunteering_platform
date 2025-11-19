const User = require('../models/user');
const Opportunity = require('../models/Opportunity');
const EventBooking = require('../models/EventBooking');
const VolunteerWork = require('../models/VolunteerWork');

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive, role, isVerified } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role) updateData.role = role;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStatistics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const volunteersCount = await User.countDocuments({ role: 'volunteer' });
    const organizationsCount = await User.countDocuments({ role: 'organization' });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Opportunity statistics
    const totalOpportunities = await Opportunity.countDocuments();
    const activeOpportunities = await Opportunity.countDocuments({ status: 'active' });
    const completedOpportunities = await Opportunity.countDocuments({ status: 'completed' });

    // Event statistics
    const totalEvents = await EventBooking.countDocuments();
    const upcomingEvents = await EventBooking.countDocuments({ 
      date: { $gte: new Date() },
      status: { $in: ['posted', 'assigned'] }
    });

    // Volunteer work statistics
    const totalVolunteerWorks = await VolunteerWork.countDocuments();
    const completedWorks = await VolunteerWork.countDocuments({ status: 'completed' });
    const totalHours = await VolunteerWork.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$hoursCompleted' } } }
    ]);

    // Recent activities
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOpportunities = await Opportunity.find()
      .populate('organization', 'name')
      .select('title category status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const platformStats = {
      users: {
        total: totalUsers,
        volunteers: volunteersCount,
        organizations: organizationsCount,
        active: activeUsers
      },
      opportunities: {
        total: totalOpportunities,
        active: activeOpportunities,
        completed: completedOpportunities
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents
      },
      volunteerWork: {
        total: totalVolunteerWorks,
        completed: completedWorks,
        totalHours: totalHours[0]?.total || 0
      },
      recentActivities: {
        users: recentUsers,
        opportunities: recentOpportunities
      }
    };

    res.json({
      success: true,
      data: platformStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get opportunities for review
// @route   GET /api/admin/opportunities/review
// @access  Private (Admin)
exports.getOpportunitiesForReview = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = {};
    
    if (status === 'pending') {
      filter.status = 'draft';
    } else if (status === 'reported') {
      // You can add a 'reported' field to Opportunity model for reported content
      filter.isReported = true;
    }

    const opportunities = await Opportunity.find(filter)
      .populate('organization', 'name email')
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
      message: 'Error fetching opportunities for review',
      error: error.message
    });
  }
};

// @desc    Approve or reject opportunity
// @route   PUT /api/admin/opportunities/:id/review
// @access  Private (Admin)
exports.reviewOpportunity = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    let updateData = {};
    
    if (action === 'approve') {
      updateData.status = 'active';
      updateData.approvedAt = new Date();
      updateData.approvedBy = req.user.id;
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.rejectionReason = reason;
    }

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('organization', 'name email');

    res.json({
      success: true,
      message: `Opportunity ${action}d successfully`,
      data: { opportunity: updatedOpportunity }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reviewing opportunity',
      error: error.message
    });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    // User registration analytics
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          volunteers: {
            $sum: { $cond: [{ $eq: ['$role', 'volunteer'] }, 1, 0] }
          },
          organizations: {
            $sum: { $cond: [{ $eq: ['$role', 'organization'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Opportunity creation analytics
    const opportunityCreations = await Opportunity.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Volunteer work completion analytics
    const workCompletions = await VolunteerWork.aggregate([
      { $match: { status: 'completed', dateCompleted: dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$dateCompleted' },
            month: { $month: '$dateCompleted' },
            day: { $dayOfMonth: '$dateCompleted' }
          },
          count: { $sum: 1 },
          totalHours: { $sum: '$hoursCompleted' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        userRegistrations,
        opportunityCreations,
        workCompletions,
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};