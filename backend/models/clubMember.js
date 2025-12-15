const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  club_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["member", "president"],
    default: "member"
  }
}, { timestamps: true });

module.exports = mongoose.models.ClubMember || mongoose.model("ClubMember", clubMemberSchema);
