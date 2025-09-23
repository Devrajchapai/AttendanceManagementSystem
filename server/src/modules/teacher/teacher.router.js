const express = require('express')
const mainRouter = express.Router()


const requireToken = require('../../middleware/requireToken')
const {setPath, uploader} = require('../../middleware/uploder')


const teacherController = require('../teacher/teacher.controller')


mainRouter.post('/updateprofile', requireToken, setPath('teacher'), uploader.single('image'), teacherController.updateProfile )
mainRouter.get('/profile', requireToken, teacherController.profile )


module.exports = mainRouter