const express = require('express')
const mainRouter = express.Router()

const requireToken = require('../../middleware/requireToken')
const {setPath, uploader} = require('../../middleware/uploder')


const studentController = require('./student.controller')


mainRouter.post('/updateProfile', requireToken, setPath('student'), uploader.single('image'), studentController.updateProfile)
mainRouter.get('/profile', requireToken, studentController.profile)

mainRouter.get('/submitAttedance', requireToken, studentController.submitAttedance)


module.exports = mainRouter