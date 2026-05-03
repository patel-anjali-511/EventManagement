const Event = require('../models/Event');
const Registration = require('../models/Registration');

const createEvent = async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, location, date, capacity, price } = req.body;
    const event = new Event({
      title,
      shortDescription,
      fullDescription,
      location,
      date,
      capacity,
      price,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
      createdBy: req.user._id,
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Event.countDocuments();
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('registrationCount')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      events,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registrationCount');
    
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, location, date, capacity, price } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.title = title || event.title;
    event.shortDescription = shortDescription || event.shortDescription;
    event.fullDescription = fullDescription || event.fullDescription;
    event.location = location || event.location;
    event.date = date || event.date;
    event.capacity = capacity || event.capacity;
    event.price = price ?? event.price;

    if (req.file) {
      event.image = `/uploads/${req.file.filename}`;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Total Income & Total Registrations
    const registrations = await Registration.find({ paymentStatus: 'Completed' }).populate('event');
    const totalIncome = registrations.reduce((acc, reg) => acc + (reg.event?.price || 0), 0);
    const totalRegistrations = registrations.length;

    // Attendance Rate
    const totalAttended = registrations.filter(reg => reg.attended).length;
    const attendancePercentage = totalRegistrations > 0 
      ? Math.round((totalAttended / totalRegistrations) * 100) 
      : 0;

    // Event Stats
    const events = await Event.find().populate('registrationCount');
    const totalEvents = events.length;
    
    // Live Events (Now between start date and some buffer, or just today)
    const totalLiveEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === now.toDateString();
    }).length;

    const upcomingEventsList = events
      .filter(e => e.date > now)
      .sort((a, b) => a.date - b.date)
      .slice(0, 10);

    const pastEventsList = events
      .filter(e => e.date <= now)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    // Chart Data
    const revenueData = events.map(e => ({
      name: e.title,
      revenue: (e.registrationCount || 0) * (e.price || 0)
    })).slice(0, 10);

    const attendanceData = events.filter(e => e.date <= now).map(e => ({
      name: e.title,
      rate: e.capacity > 0 ? Math.round(((e.registrationCount || 0) / e.capacity) * 100) : 0
    })).slice(0, 10);

    res.json({
      totalIncome,
      totalEvents,
      totalLiveEvents,
      totalRegistrations,
      attendancePercentage,
      upcomingEvents: upcomingEventsList,
      pastEvents: pastEventsList,
      revenueData,
      attendanceData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent, getAdminStats };
