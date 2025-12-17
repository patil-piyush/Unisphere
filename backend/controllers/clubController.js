const Club = require('../models/club');
const ClubMember = require('../models/clubMember'); // You forgot to import this
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =================================================
// CREATE A NEW CLUB
// =================================================
const createClub = async (req, res) => {
  try {
    const { name, description, logoURL, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClub = await Club.create({   // <-- fixed creat to create
      name,
      description,
      logoURL,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "Club registered successfully", club: newClub });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =================================================
// CLUB LOGIN + COOKIE SET
// =================================================
const loginClub = async (req, res) => {
  try {
    const { email, password } = req.body;

    const club = await Club.findOne({ email });
    if (!club) return res.status(404).json({ message: "Club not found" });

    const isValid = await bcrypt.compare(password, club.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: club._id,
        role: "president",
        type: "club"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ===== COOKIE SET HERE =====
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ message: "Club login successful" });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =================================================
// UPDATE CLUB
// =================================================
const updateClub = async (req, res) => {
  try {
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedClub) return res.status(404).json({ message: "Club not found" });

    res.status(200).json({ message: "Club updated", club: updatedClub });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =================================================
// DELETE CLUB
// =================================================
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    res.status(200).json({ message: "Club deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =================================================
// GET ALL CLUBS
// =================================================
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().select("-password");
    const totalClubs = await Club.countDocuments();
    res.status(200).json({
      count: totalClubs,
      clubs
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =================================================
// CHANGE CLUB PASSWORD
// =================================================
const changeClubPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const club = await Club.findById(req.clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    const isValid = await bcrypt.compare(oldPassword, club.password);
    if (!isValid) return res.status(401).json({ message: "Incorrect Password" });

    club.password = await bcrypt.hash(newPassword, 10);
    await club.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// get club details
const getClubDetails = async (req, res) => {
  try {
    const club = await Club.findById(req.clubId).select("-password");
    if (!club) return res.status(404).json({ message: "Club not found" });
    res.status(200).json(club);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// =================================================
// LOGOUT CLUB
// =================================================
const logoutClub = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Club logged out successfully" });
};

module.exports = {
  createClub,
  loginClub,
  updateClub,
  deleteClub,
  getAllClubs,
  changeClubPassword,
  logoutClub,
  getClubDetails
};
