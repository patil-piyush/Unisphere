const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,     
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    logoURL: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.models.Club || mongoose.model("Club", clubSchema);
