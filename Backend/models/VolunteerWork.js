const mongoose = require('mongoose');

const volunteerWorkSchema = new mongoose.Schema({
  volunteer_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  hours_logged: {
    type: Number,
    required: true
  },
  work_date: {
    type: Date,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review'
  },
  admin_feedback: String
}, {
  timestamps: true
});

module.exports = mongoose.model('VolunteerWork', volunteerWorkSchema);