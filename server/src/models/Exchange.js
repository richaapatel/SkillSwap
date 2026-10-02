const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient duplicate-pending-request detection
exchangeSchema.index({ learner: 1, teacher: 1, skill: 1, status: 1 });

module.exports = mongoose.model('Exchange', exchangeSchema);
