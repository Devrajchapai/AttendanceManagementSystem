const express = require('express');
const mainRouter = express.Router();

const authRouter = require('../modules/auth/authRouter')


mainRouter.use('/authRouter', authRouter)


module.exports =  mainRouter; 
