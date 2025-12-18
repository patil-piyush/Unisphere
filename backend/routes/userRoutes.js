const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getAllUsers,
  deleteUser,
  logoutUser
} = require("../controllers/userController");
const { userAuthMiddleware} = require("../middlewares/userAuthMiddleware");
const { adminAuthMiddleware } = require("../middlewares/adminAuthMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", userAuthMiddleware, logoutUser);

router.get("/me", userAuthMiddleware, getUserProfile);
router.put("/me", userAuthMiddleware,
  upload.fields([
    { name: "profileIMG", maxCount: 1 },
    { name: "bannerIMG", maxCount: 1 },
  ]), updateUserProfile);
router.put("/change-password", userAuthMiddleware, updateUserPassword);

router.get("/all", userAuthMiddleware, adminAuthMiddleware, getAllUsers);
router.delete("/me", userAuthMiddleware, deleteUser);

module.exports = router;
