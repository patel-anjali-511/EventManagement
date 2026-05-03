const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sendEmail = require('../utils/sendEmail');

const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.refundStatus && req.query.refundStatus !== 'All') {
      query.refundStatus = req.query.refundStatus;
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('event', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      payments,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processRefund = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: 'registration',
      populate: [{ path: 'event' }, { path: 'user' }],
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.refundStatus === 'Processed') {
      return res.status(400).json({ message: 'Refund already processed' });
    }

    let paymentIntentId = payment.stripePaymentId;

    if (paymentIntentId.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(paymentIntentId);
      if (!session.payment_intent) {
        return res.status(400).json({ message: 'Could not retrieve payment intent from Stripe session' });
      }
      paymentIntentId = session.payment_intent;
    }

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(payment.amount * 100),
    });

    payment.refundStatus = 'Processed';
    payment.status = 'Refunded';
    await payment.save();

    if (payment.registration) {
      const registration = await Registration.findById(payment.registration._id);
      if (registration) {
        registration.paymentStatus = 'Refunded';
        registration.status = 'Cancelled';
        await registration.save();
      }
    }

    if (payment.registration?.user && payment.registration?.event) {
      const { user, event } = payment.registration;
      const refundHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #171717;">
          <h2 style="text-align: center; font-size: 24px; color: #16a34a;">Refund Approved</h2>
          <p>Hi ${user.name},</p>
          <p>Your refund request for <strong>${event.title}</strong> has been approved and processed.</p>
          <div style="background-color: #fafafa; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #f5f5f5;">
            <p style="margin: 0;"><strong>Ticket ID:</strong> ${payment.registration._id}</p>
            <p style="margin: 8px 0 0 0;"><strong>Refund Amount:</strong> ₹${payment.amount}</p>
            <p style="margin: 8px 0 0 0;"><strong>Status:</strong> Refunded</p>
          </div>
          <p style="color: #666; font-size: 14px;">The amount will be credited to your original payment method within 5–7 business days.</p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: `Refund Approved: ${event.title}`,
        html: refundHtml,
      });
    }

    res.json({ message: 'Refund processed successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectRefund = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: 'registration',
      populate: [{ path: 'event' }, { path: 'user' }],
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.refundStatus !== 'Requested') {
      return res.status(400).json({ message: 'No pending refund request for this payment' });
    }

    payment.refundStatus = 'Rejected';
    await payment.save();

    if (payment.registration) {
      const registration = await Registration.findById(payment.registration._id);
      if (registration) {
        registration.paymentStatus = 'Completed';
        registration.status = 'Registered';
        await registration.save();
      }
    }

    if (payment.registration?.user && payment.registration?.event) {
      const { user, event } = payment.registration;
      const rejectHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #171717;">
          <h2 style="text-align: center; font-size: 24px; color: #171717;">Your Ticket Has Been Reactivated</h2>
          <p>Hi ${user.name},</p>
          <p>Your refund request for <strong>${event.title}</strong> has been reviewed and rejected. Your ticket is now <strong>active again</strong> and you can attend the event as planned.</p>
          <div style="background-color: #fafafa; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #f5f5f5;">
            <p style="margin: 0;"><strong>Ticket ID:</strong> ${payment.registration._id}</p>
            <p style="margin: 8px 0 0 0;"><strong>Event:</strong> ${event.title}</p>
            <p style="margin: 8px 0 0 0;"><strong>Ticket Status:</strong> Active</p>
            <p style="margin: 8px 0 0 0;"><strong>Refund Status:</strong> Rejected</p>
          </div>
          <p style="color: #666; font-size: 14px;">If you believe this is a mistake or have any questions, please contact our support team.</p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: `Ticket Reactivated: ${event.title}`,
        html: rejectHtml,
      });
    }

    res.json({ message: 'Refund request rejected', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPayments,
  processRefund,
  rejectRefund,
};
