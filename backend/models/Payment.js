const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  stripePaymentId: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'Failed', 'Refunded'],
    default: 'Completed',
  },
  refundStatus: {
    type: String,
    enum: ['None', 'Requested', 'Processed', 'Rejected'],
    default: 'None',
  },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
