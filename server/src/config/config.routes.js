const express = require('express');
const mainRouter = express.Router();

const authRouter = require('../modules/auth/authRouter')
const studentRouter = require('../modules/student/student.router')
const teacherRouter = require('../modules/teacher/teacher.router')
const adminRouter = require('../modules/admin/admin.router')

mainRouter.use('/authRouter', authRouter)
mainRouter.use('/student', studentRouter)
mainRouter.use('/teacher', teacherRouter )
mainRouter.use('/admin', adminRouter )



module.exports =  mainRouter; 
