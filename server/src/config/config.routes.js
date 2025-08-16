const express = require('express');
const mainRouter = express.Router();

const authRouter = require('../modules/auth/authRouter')
const studentRouter = require('../modules/student/student.router')

mainRouter.use('/authRouter', authRouter)
mainRouter.use('/student', studentRouter)

module.exports =  mainRouter; 
