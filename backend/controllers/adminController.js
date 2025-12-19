const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Club = require('../models/club');
require("dotenv").config();

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check user exists
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // // 2️⃣ Check admin role
    // if (user.role !== "admin") {
    //   return res.status(403).json({ message: "Unauthorized access" });
    // }

    // 3️⃣ Verify password
    // const valid = await bcrypt.compare(password, user.password);
    // if (!valid) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }


    // Using env variables for admin credentials
      if (email !== process.env.ADMIN_EMAIL) {
        return res.status(404).json({ message: "Invalid Credentials"});
      }

      const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid Credentials" });
      }

    // 4️⃣ Create admin token (VERY IMPORTANT)
    const token = jwt.sign(
      {
        //id: user._id,
        role: "admin",
        type: "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ message: "Admin login successful" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changeClubPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const club = await Club.findById(req.params.id);
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



module.exports = {
  adminLogin,
  changeClubPassword
}