const express = require('express');
const mainRouter = express.Router();

const authRouter = require('../modules/auth/authRouter')


mainRouter.post('/authRouter', authRouter)


module.exports =  mainRouter; 
