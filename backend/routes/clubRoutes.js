const express = require('express');
const router = express.Router();

const clubAuth = require('../middlewares/clubAuthMiddleware');

const {
    createClub,
    loginClub,
    updateClub,
    deleteClub,
    getAllClubs,
    changeClubPassword,
    logoutClub,
    getClubDetails
} = require('../controllers/clubController');

const {
    addClubMember,
    removeClubMember,
    getClubMembers
} = require('../controllers/clubMemberController');

// public
router.post('/register', createClub);
router.post('/login', loginClub);

// Auth Club
router.post('/logout', clubAuth, logoutClub);
router.put('/change-password', clubAuth, changeClubPassword);
// router.get('/', clubAuth, getAllClubs);
router.put('/:id', clubAuth, updateClub);
router.delete('/:id', clubAuth, deleteClub);
router.get('/', clubAuth, getClubDetails);

// Club management by club
router.post('/addMember', clubAuth, addClubMember);
router.delete('/delMember/:memberId', clubAuth, removeClubMember);
router.get('/members', clubAuth, getClubMembers);

module.exports = router;