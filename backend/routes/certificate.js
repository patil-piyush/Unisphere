const express = require('express');
const router = express.Router();
const { certificateCredentials } = require('../controllers/certificateController');
const { userAuthMiddleware } = require('../middlewares/userAuthMiddleware');

router.get('/:eventId', userAuthMiddleware, certificateCredentials);

module.exports = router;