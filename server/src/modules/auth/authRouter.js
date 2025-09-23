const express = require('express')
const authRouter = express.Router();

const authController = require('./authController');
const requireToken = require('../../middleware/requireToken');


authRouter.post('/login',authController.login)
authRouter.put('/passwordChange',requireToken, authController.passwordChange)


module.exports = authRouter