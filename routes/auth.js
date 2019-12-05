const express = require('express');

const db = require('../controllers/auth');

const router = express.Router();


router.get('/', db.getUsers);

router.post('/create-user', db.signup);

router.post('/login', db.login);


module.exports = router;