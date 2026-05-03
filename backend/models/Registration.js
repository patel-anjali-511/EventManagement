const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    // Optional because we might allow guest registrations or users might not be logged in to register.
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    // Stores the generated Data URL or a unique string for the QR code
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  status: {
    type: String,
    enum: ['Registered', 'Cancelled'],
    default: 'Registered',
  },
  attended: {
    type: Boolean,
    default: false,
  },
  bookingId: {
    type: String,
    // Shared ID for multiple tickets in the same booking
  },
}, { timestamps: true });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
