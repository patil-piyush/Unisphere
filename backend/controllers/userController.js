const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require("../config/cloudinary");

// helper to upload a buffer to Cloudinary
const uploadBufferToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

// register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, college_Name, department, year_of_study, interest } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashed,
      college_Name,
      department,
      year_of_study,
      interest
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days 
    });

    res.status(200).json({ message: "Login successful" });


  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
}

// update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // set in userAuthMiddleware
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updates = {};

    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }

    if (typeof req.body.aboutMe === "string") {
      updates.aboutMe = req.body.aboutMe.trim();
    }

    if (typeof req.body.interest === "string") {
      const interestArray = req.body.interest
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      updates.interest = interestArray;
    }

    // profile image -> Cloudinary
    if (
      req.files &&
      Array.isArray(req.files.profileIMG) &&
      req.files.profileIMG[0]
    ) {
      const file = req.files.profileIMG[0];
      const profileUrl = await uploadBufferToCloudinary(file, "users/profile");
      updates.profileIMG = profileUrl;
    }

    // banner image -> Cloudinary
    if (
      req.files &&
      Array.isArray(req.files.bannerIMG) &&
      req.files.bannerIMG[0]
    ) {
      const file = req.files.bannerIMG[0];
      const bannerUrl = await uploadBufferToCloudinary(file, "users/banner");
      updates.bannerIMG = bannerUrl;
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "profile updated", user: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// update password
const updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
}

// delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.clearCookie('token');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// search user by name, college, department or interest
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const search = new RegExp(query, 'i');

    const users = await User.find({
      $or: [
        { name: search },
        { college_Name: search },
        { department: search },
        { interest: search }
      ]
    }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

//logout user
const logoutUser = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getAllUsers,
  deleteUser,
  searchUsers,
  logoutUser
}