const express = require('express');
const router = express.Router();

const {adminAuthMiddleware} = require('../middlewares/adminAuthMiddleware');
const {adminLogin, changeClubPassword} = require('../controllers/adminController');

const {
    createClub,
    updateClub,
    deleteClub,
    getAllClubs,
} = require('../controllers/clubController');

const {
    addClubMember,
    removeClubMember,
    getClubMembers
} = require('../controllers/clubMemberController');

const {
    getAllUsers,
    deleteUser,
    searchUsers
} = require('../controllers/userController');

const {
    getAllEvents,
    getClubEvents,
    getCurrentMonthEventCount
} = require('../controllers/eventsController')

// public
router.post('/login', adminLogin);

// Auth Club
router.post('/register',adminAuthMiddleware, createClub);

router.put('/:id/change-password', adminAuthMiddleware, changeClubPassword);
router.get('/', adminAuthMiddleware, getAllClubs);
router.put('/:id', adminAuthMiddleware, updateClub);
router.delete('/:id', adminAuthMiddleware, deleteClub);

// Club management by club
router.post('/members/:clubId', adminAuthMiddleware, addClubMember);
router.delete('/members/:clubId/:memberId', adminAuthMiddleware, removeClubMember);
router.get('/members/:clubId', adminAuthMiddleware, getClubMembers);

// Users management
router.get('/users', adminAuthMiddleware, getAllUsers); // will give count too
router.delete('/users/:id', adminAuthMiddleware, deleteUser);
router.get('/users/search', adminAuthMiddleware, searchUsers);

// Events management
router.get('/events', adminAuthMiddleware, getAllEvents);
router.get('/events/club/:clubId', adminAuthMiddleware, getClubEvents);
router.get('/events/current-month/count', adminAuthMiddleware, getCurrentMonthEventCount);

module.exports = router;