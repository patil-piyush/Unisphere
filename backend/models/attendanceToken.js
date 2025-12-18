const mongoose = require('mongoose');

const attendanceTokenSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiration: {
        type: Date,
        required: true,
        index: { expires: 0 }   // auto-delete after expiration
    },
    duration: {
        type: Number, // seconds
        default: 30
    }
}, { timestamps: true });

attendanceTokenSchema.index({ event_id: 1, token: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceToken', attendanceTokenSchema);
