const Registration = require('../models/Registration');
const Event = require('../models/Event');

const registerForEvent = async (req, res) => {
  try {
    const { eventId, full_name, phone, address, emergency_contact, special_requirements } = req.body;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event is in the past
    if (new Date(event.start_date) < new Date()) {
      return res.status(400).json({ error: 'Event has already passed' });
    }
    
    const registrationData = {
      full_name: full_name || `${req.user.first_name} ${req.user.surname}`,
      phone: phone || req.user.phone,
      address: address || req.user.address,
      emergency_contact,
      special_requirements
    };
    
    const registration = await Registration.create(userId, eventId, registrationData);
    res.status(201).json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    if (error.message === 'Already registered for this event') {
      return res.status(409).json({ error: error.message });
    }
    if (error.message === 'Event is full') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    const cancelled = await Registration.cancel(userId, eventId);
    if (!cancelled) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkRegistration = async (req, res) => {
  try {
    const { eventId } = req.query;
    const userId = req.user.id;
    
    const registration = await Registration.findByUserAndEvent(userId, eventId);
    res.json({ 
      isRegistered: !!registration,
      registration: registration || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await Registration.findByUser(userId);
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.findByEvent(eventId);
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  checkRegistration,
  getUserRegistrations,
  getEventRegistrations
};
