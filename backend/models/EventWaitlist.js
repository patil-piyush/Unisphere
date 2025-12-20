const mongoose = require('mongoose');

const eventWaitListSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    joined_at: {
        type: Date,
        default: Date.now,
    }
},{timestamps: true});

eventWaitListSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

const EventWaitList = mongoose.model('EventWaitList', eventWaitListSchema);

module.exports = EventWaitList;