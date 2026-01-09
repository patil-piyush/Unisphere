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
    },
    permanentBadges: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge"
    },
    club_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        default: null
    },
    position_in_club: {
        type: String,
        enum: ['President', 'Vice President', 'Secretary', 'Technical Lead','Web Master','Visual Media Member','Public Relation Member', null],
        default: null
    }
}, { timestamps: true });



module.exports = mongoose.models.User || mongoose.model("User", userSchema);
