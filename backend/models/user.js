const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    college_Name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    year_of_study: {
        type: String,
        required: true  
    },
    interest: {
        type: [String],
    },
    profileIMG: {
        type: String,
    },
    bannerIMG: {
        type: String,
    },
    role: {
        type: String,
        enum: ['student', 'clubMember', 'admin'],
        default: 'student'
    },
    aboutMe: {
        type: String
    }
}, { timestamps: true });



module.exports = mongoose.models.User || mongoose.model("User", userSchema);
