const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
  // Event Details
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['environmental', 'education', 'healthcare', 'community', 'animal_welfare', 'other']
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Event duration is required']
  },
  
  // Location Details
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Volunteer Requirements
  volunteersRequired: {
    type: Number,
    required: [true, 'Number of volunteers required is needed'],
    min: 1
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  
  // Event Logistics
  budget: {
    type: Number,
    default: 0
  },
  specialRequirements: {
    type: String,
    trim: true
  },
  contactPerson: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  
  // Volunteer Assignments
  assignedVolunteers: [{
    volunteer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      default: 'General Volunteer'
    },
    status: {
      type: String,
      enum: ['assigned', 'completed', 'cancelled'],
      default: 'assigned'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    hoursCompleted: {
      type: Number,
      default: 0
    }
  }],
  
  // Event Status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Additional Fields
  images: [{
    url: String,
    caption: String
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
eventBookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
eventBookingSchema.index({ organizer: 1, status: 1 });
eventBookingSchema.index({ date: 1 });
eventBookingSchema.index({ 'location.city': 1 });
eventBookingSchema.index({ eventType: 1 });

// Virtual for checking if event is full
eventBookingSchema.virtual('isFull').get(function() {
  return this.assignedVolunteers.length >= this.volunteersRequired;
});

// Virtual for available slots
eventBookingSchema.virtual('availableSlots').get(function() {
  return Math.max(0, this.volunteersRequired - this.assignedVolunteers.length);
});

// Method to check if volunteer is assigned
eventBookingSchema.methods.isVolunteerAssigned = function(volunteerId) {
  return this.assignedVolunteers.some(assignment => 
    assignment.volunteer.toString() === volunteerId.toString()
  );
};

// Static method to get events by organizer
eventBookingSchema.statics.findByOrganizer = function(organizerId) {
  return this.find({ organizer: organizerId }).populate('assignedVolunteers.volunteer');
};

// Static method to get upcoming events
eventBookingSchema.statics.getUpcomingEvents = function() {
  return this.find({ 
    date: { $gte: new Date() },
    status: { $in: ['pending', 'assigned', 'in-progress'] }
  }).populate('organizer', 'name avatar rating');
};

module.exports = mongoose.model('EventBooking', eventBookingSchema);