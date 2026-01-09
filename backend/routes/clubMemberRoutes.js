const express = require("express");
const router = express.Router();

const { loginClubMember, logoutClubMember } = require("../controllers/clubMemberController");
const clubMemberAuth = require("../middlewares/clubMemberAuth");

//router.post("/login", loginClubMember);
router.post("/logout", clubMemberAuth, logoutClubMember);

module.exports = router;
