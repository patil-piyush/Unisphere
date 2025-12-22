const ClubMember = require("../models/ClubMember");
const Club = require("../models/Club");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Club adds member
const addClubMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const clubId = req.clubId;  

    if (!clubId) {
      return res.status(401).json({ message: "Club ID not found on request" });
    }
    const exists = await ClubMember.findOne({ email });
    if (exists) return res.status(400).json({ message: "Member already exists" });

    const member = await ClubMember.create({
      name,
      email,
      club_id:clubId,
      role: role || "member"
    });

    res.status(201).json({ message: "Member added successfully", member });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Member login (email + club password)
const loginClubMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    const member = await ClubMember.findOne({ email });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const club = await Club.findById(member.club_id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    const valid = await bcrypt.compare(password, club.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        memberId: member._id,
        clubId: member.club_id,
        role: member.role,
        type: "member"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // Adjust based on your frontend domain x sameSite = "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Member login successful" });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// // Get all members of logged-in club
// const getClubMembers = async (req, res) => {
//   try {
//     const { clubId } = req.params;
//     const members = await ClubMember.find({ club_id: clubId });
//     res.status(200).json(members);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Get all members of logged-in club
const getClubMembers = async (req, res) => {
  try {
    const clubId = req.clubId;  

    if (!clubId) {
      return res.status(401).json({ message: "Club ID not found on request" });
    }

    const members = await ClubMember.find({ club_id: clubId });
    res.status(200).json(members);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove member (club only)
const removeClubMember = async (req, res) => {
  try {

    const { memberId } = req.params;
    const clubId = req.clubId;  

    if (!clubId) {
      return res.status(401).json({ message: "Club ID not found on request" });
    }

    const member = await ClubMember.findOneAndDelete({
      _id: memberId,
      club_id: clubId
    });

    if (!member) return res.status(404).json({ message: "Member not found" });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Member logout
const logoutClubMember = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Member logged out successfully" });
};

module.exports = {
  addClubMember,
  loginClubMember,
  getClubMembers,
  removeClubMember,
  logoutClubMember
};
