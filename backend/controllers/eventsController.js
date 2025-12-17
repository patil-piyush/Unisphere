const Event = require('../models/event')
const EventRegistration = require('../models/eventRegistration')
const EventWaitlist = require('../models/eventWaitlist')
const transporter = require('../config/mail')
const cloudinary = require("../config/cloudinary");


const Comment = require("../models/comments")


// create a new event president only
// const createEvent = async (req, res) => {
//     try {
//         const {
//             title,
//             description,
//             bannerURL,
//             date,
//             venue,
//             start_time,
//             end_time,
//             deadline,
//             max_capacity,
//             location_coordinates
//         } = req.body;

//         if(new Date(deadline) <= new Date()){
//             return res.status(400).json({ error: 'Deadline must be a future date' });
//         }

//         if(new Date(end_time) <= new Date(start_time)){
//             return res.status(400).json({ error: 'End time must be after start time' });
//         }

//         if(new Date(date) < new Date()){
//             return res.status(400).json({ error: 'Event date must be a future date' });
//         }

//         const event = await Event.create({
//             club_id: req.clubId,
//             title,
//             description,
//             bannerURL,
//             date,
//             venue,
//             start_time,
//             end_time,
//             deadline,
//             max_capacity,
//             location_coordinates
//         })

//         res.status(201).json({ message: 'Event created successfully', event });

//     }catch(error){
//         res.status(500).send({ error: 'Failed to create event' });
//     }
// }

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      clubName,
      venue,
      start_date,
      start_time,
      end_date,
      end_time,
      max_capacity,
      category,
      location_lat,
      location_lng,
      price,
    } = req.body;


    // Basic validation based on schema
    if (!title || !description || !venue || !start_date || !start_time || !end_date || !end_time || !max_capacity) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Convert numeric and date/time values
    const maxCapacityNum = Number(max_capacity);
    if (Number.isNaN(maxCapacityNum) || maxCapacityNum <= 0) {
      return res.status(400).json({ error: "max_capacity must be a positive number." });
    }

    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);

    // normalize to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDay = new Date(startDateObj);
    startDay.setHours(0, 0, 0, 0);

    if (endDateObj < startDateObj) {
      return res.status(400).json({ error: "End date must be on or after start date." });
    }

    if (startDay < today) {
      return res.status(400).json({ error: "Event start date must be today or in the future." });
    }


    // Handle coordinates
    const lat = Number(location_lat);
    const lng = Number(location_lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "Invalid location coordinates." });
    }

    // Upload banner image if provided
    let bannerURL;
    if (req.file) {
      // using buffer upload
      const uploaded = await cloudinary.uploader.upload_stream(
        {
          folder: "events/banners",
          resource_type: "image",
        },
        (error, result) => {
          if (error) console.log(error);
          return result;
        }
      );

      // cloudinary.uploader.upload_stream is callback-based; easier:

      bannerURL = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "events/banners",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }
    
    const event = await Event.create({
      club_id: req.clubId, // set by auth middleware from JWT
      clubName,
      title,
      description,
      bannerURL: bannerURL || undefined,
      category: category || undefined, // will default to 'Seminar' if undefined
      venue,
      start_time,
      start_date: startDateObj,
      end_time,
      end_date: endDateObj,
      max_capacity: maxCapacityNum,
      price: Number(price) || 0,
      location_coordinates: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
      },
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).send({ error: "Failed to create event" });
  }
};

// update event details both president and members
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Fetch real event from DB
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event Not Found" });
    }

    // Authorization: Only this club can update its event
    if (event.club_id.toString() !== req.clubId.toString()) {
      return res.status(403).json({ error: "Unauthorized to update this event" });
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      message: "Event Updated Successfully",
      event: updatedEvent
    });

  } catch (error) {
    console.error("Create event error:", error);
    // If it's a Mongoose validation error, send 400 with details
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: Object.values(error.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ error: error.message || "Failed to create event" });
  }

};


// delete event president only 
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log("DELETE /api/events/:id ->", eventId);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event Not Found" });
    }

    // Ensure req.clubId exists and is a string
    console.log("req.clubId =", req.clubId, "event.club_id =", event.club_id);
    if (event.club_id.toString() !== req.clubId.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this event" });
    }

    // Make sure these models are imported and spelled correctly
    await EventRegistration.deleteMany({ event_id: event._id });
    await EventWaitlist.deleteMany({ event_id: event._id });
    await Comment.deleteMany({ event_id: event._id });

    await Event.findByIdAndDelete(event._id);

    return res.status(200).json({ message: "Event Deleted Successfully" });
  } catch (error) {
    console.error("Delete event error:", error);  // <-- see exact cause in server logs
    return res.status(500).json({ error: error.message });
  }
};

//close registration
const closeRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event Not Found" });

    if (event.club_id.toString() !== req.clubId.toString()) {
      return res.status(403).json({ error: "Not your event" });
    }

    event.isClosed = true;    // <-- FIXED
    await event.save();

    res.status(200).json({ message: "Event Registrations Closed" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//reopen registration

const openRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event Not Found" });

    if (event.club_id.toString() !== req.clubId.toString()) {
      return res.status(403).json({ error: "Not your event" });
    }

    event.isClosed = false;   // <-- FIXED
    await event.save();

    res.status(200).json({ message: "Event Registrations Opened" }); // <-- FIXED MESSAGE

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all events 
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("club_id", "name logoURL")
      .sort({ start_time: 1 });

    if (!events) return res.status(404).json({ message: "No Events Found" });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//get event of logged-in clubs
const getClubEvents = async (req, res) => {
  try {
    const events = await Event.find({ club_id: req.clubId })
      .sort({ start_time: 1 });

    if (!events) return res.status(404).json({ message: "No Events Found" });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// get registrations of an event 
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.club_id.toString() !== req.clubId) {
      return res.status(403).json({ message: "Not your event" });
    }

    const registrations = await EventRegistration.find({ event_id: event._id })
      .populate("user_id", "name email college_Name department");

    const waitlist = await EventWaitlist.find({ event_id: event._id })
      .populate("user_id", "name email college_Name department")
      .sort({ joinedAt: 1 });

    res.status(200).json({ registrations, waitlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get event by id public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("club_id", "name logoURL");

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  closeRegistration,
  openRegistration,
  getAllEvents,
  getClubEvents,
  getEventRegistrations,
  getEventById
}
