const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const QRCode = require("qrcode");
const sendEmail = require("../utils/sendEmail");

const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Bookings are closed for past events' });
    }

    if (event.price <= 0) {
      return res.status(400).json({ message: 'This is a free event' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: event.title,
              description: event.shortDescription,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/events/${eventId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/events/${eventId}?canceled=true`,
      metadata: {
        eventId: event._id.toString(),
        userId: req.user._id.toString(),
        quantity: quantity.toString(),
      },
      customer_email: req.user.email,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { eventId, sessionId, quantity = 1 } = req.body;
    const { name, email, _id: userId } = req.user;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Bookings are closed for past events' });
    }

    let finalQuantity = quantity;

    // Verify payment if event is not free
    if (event.price > 0) {
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required for paid events' });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
      
      if (session.metadata && session.metadata.quantity) {
        finalQuantity = parseInt(session.metadata.quantity, 10);
      }
    }

    // Check capacity against the requested quantity
    const registrationCount = await Registration.countDocuments({
      event: eventId,
      status: { $ne: 'Cancelled' }
    });
    
    if (registrationCount + finalQuantity > event.capacity) {
      return res.status(400).json({ message: `Not enough spots available. Only ${event.capacity - registrationCount} left.` });
    }
    
    const savedRegistrations = [];
    const qrCodeAttachments = [];
    const bookingId = sessionId || `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create 'finalQuantity' number of registrations
    for (let i = 0; i < finalQuantity; i++) {
        const registration = new Registration({
          event: eventId,
          name,
          email,
          user: userId,
          paymentStatus: 'Completed',
          bookingId: bookingId,
        });
    
        // Generate unique QR code for the ticket
        const qrData = JSON.stringify({ registrationId: registration._id, eventId });
        const qrCodeDataURL = await QRCode.toDataURL(qrData);
        registration.qrCode = qrCodeDataURL;
    
        const savedRegistration = await registration.save();
        savedRegistrations.push(savedRegistration);
        
        // Save Payment Record if paid
        if (event.price > 0 && sessionId) {
           const payment = new Payment({
              stripePaymentId: sessionId, // Use sessionId as ref
              user: userId,
              event: eventId,
              registration: savedRegistration._id,
              amount: event.price,
              status: 'Completed',
              refundStatus: 'None'
           });
           await payment.save();
        }
        
        qrCodeAttachments.push({
          filename: `ticket-qr-${i + 1}.png`,
          path: qrCodeDataURL,
          cid: `ticket-qrcode-${i + 1}`
        });
    }

    // Send Ticket Email
    const ticketsHtml = savedRegistrations.map((reg, index) => `
        <div style="text-align: center; margin: 32px 0;">
          <p style="font-size: 14px; text-transform: uppercase; font-weight: bold; color: #171717;">Ticket ${index + 1} of ${finalQuantity}</p>
          <img src="cid:ticket-qrcode-${index + 1}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 1px solid #eee; border-radius: 8px; padding: 10px;"/>
          <p style="color: #666; font-size: 11px;">Ticket ID: ${reg._id}</p>
        </div>
        <hr style="border: none; border-top: 1px dashed #eee; margin: 24px 0;" />
    `).join('');

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #171717;">
        <h2 style="text-align: center; font-size: 24px;">Your Event Ticket${finalQuantity > 1 ? 's' : ''}</h2>
        <p>Hi ${name},</p>
        <p>Your registration for <strong>${event.title}</strong> is confirmed! You secured ${finalQuantity} ticket${finalQuantity > 1 ? 's' : ''}.</p>
        <div style="background-color: #fafafa; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #f5f5f5;">
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          <p style="margin: 0;"><strong>Location:</strong> ${event.location}</p>
          <p style="margin: 8px 0 0 0;"><strong>Booking ID:</strong> ${bookingId}</p>
        </div>
        ${ticketsHtml}
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `Ticket Confirmed: ${event.title}`,
      html: emailHtml,
      attachments: qrCodeAttachments
    });

    res.status(201).json(savedRegistrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
    }).populate("event");
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsForEvent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Registration.countDocuments({ event: req.params.eventId });
    const registrations = await Registration.find({
      event: req.params.eventId,
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

    res.json({
      registrations,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({ _id: req.params.id, user: req.user._id }).populate('event');

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({ message: "Registration is already cancelled" });
    }

    registration.status = 'Cancelled';

    let refundMessage = '';
    let refundAmount = 0;

    if (registration.event.price > 0) {
      const payment = await Payment.findOne({ registration: registration._id, refundStatus: 'None' });
      if (payment) {
        payment.refundStatus = 'Requested';
        await payment.save();
        refundAmount = payment.amount;
        refundMessage = `A refund request of ₹${refundAmount} has been initiated and will be processed shortly.`;
      } else {
        refundMessage = 'Cancellation confirmed.';
      }
    } else {
      refundMessage = 'Cancellation confirmed.';
    }

    await registration.save();

    const cancelHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #171717;">
        <h2 style="text-align: center; font-size: 24px; color: #dc2626;">Ticket Cancelled</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your ticket for <strong>${registration.event.title}</strong> has been cancelled.</p>
        <div style="background-color: #fafafa; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #f5f5f5;">
          <p style="margin: 0;"><strong>Ticket ID:</strong> ${registration._id}</p>
          ${refundAmount > 0 ? `<p style="margin: 8px 0 0 0;"><strong>Refund Amount:</strong> ₹${refundAmount}</p>` : ''}
          <p style="margin: 8px 0 0 0;"><strong>Status:</strong> ${refundMessage}</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: req.user.email,
      subject: `Ticket Cancelled: ${registration.event.title}`,
      html: cancelHtml,
    });

    res.json({ message: "Ticket cancelled successfully", registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyRegistration = async (req, res) => {
  try {
    let registrationId = req.body.qrData;

    // Handle stringified JSON from the QR code cleanly
    try {
      const parsedData = JSON.parse(registrationId);
      if (parsedData.registrationId) {
        registrationId = parsedData.registrationId;
      }
    } catch (e) {
      // If it's not JSON, it might just be the raw ID string, which is fine
    }

    const registration = await Registration.findById(registrationId).populate(
      "event",
    );

    if (!registration) {
      return res
        .status(404)
        .json({ message: "Invalid ticket - Registration not found" });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({ message: "Ticket has been cancelled and cannot be used" });
    }

    if (registration.attended) {
      return res.status(400).json({ message: "Ticket already scanned!" });
    }

    registration.attended = true;
    await registration.save();

    res.json({
      message: "Ticket verified successfully!",
      attendee: registration.name,
      event: registration.event.title,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerForEvent,
  getRegistrationsForEvent,
  getMyRegistrations,
  verifyRegistration,
  createCheckoutSession,
  cancelRegistration,
};
