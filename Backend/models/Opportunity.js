const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  duration_hours: {
    type: Number,
    required: [true, 'Please add duration in hours']
  },
  location: {
    address: {
      type: String,
      required: true
    },
    isRemote: {
      type: Boolean,
      default: false
    }
  },
  commitment: {
    type: String,
    enum: ['one-time', 'weekly', 'monthly'],
    default: 'one-time'
  },
  skillsRequired: [String],
  total_spots: {
    type: Number,
    required: [true, 'Please add total spots']
  },
  filled_spots: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  volunteersApplied: [{
    volunteer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);