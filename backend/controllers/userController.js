const User = require('../models/User');
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

    const userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Adjust based on your frontend domain x sameSite = "Strict",
      maxAge:  24 * 60 * 60 * 1000 // 1 days 
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
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updates = {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.files?.profileIMG?.[0]) {
      // delete old profile image
      if (user.profileIMG?.public_id) {
        await cloudinary.uploader.destroy(user.profileIMG.public_id);
      }

      const file = req.files.profileIMG[0];
      const uploaded = await uploadBufferToCloudinary(file, "users/profile");

      updates.profileIMG = {
        url: uploaded.url,
        public_id: uploaded.public_id,
      };
    }

    if (req.files?.bannerIMG?.[0]) {
      // delete old banner image
      if (user.bannerIMG?.public_id) {
        await cloudinary.uploader.destroy(user.bannerIMG.public_id);
      }

      const file = req.files.bannerIMG[0];
      const uploaded = await uploadBufferToCloudinary(file, "users/banner");

      updates.bannerIMG = {
        url: uploaded.url,
        public_id: uploaded.public_id,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const users = await User.find().select("-password");
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      count: totalUsers,
      users
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

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

// logout user
const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',      // must match login
    sameSite: "none",
    path: "/",          // must match login
  })
  return res.status(200).json({ message: "Logged out successfully" })
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