const express = require('express')
const mainRouter = express.Router()

const requireToken = require('../../middleware/requireToken')

const studentController = require('./student.controller')


mainRouter.post('/updateprofile', requireToken, studentController.updateProfile)


mainRouter.get('/profile', requireToken, studentController.profile)

module.exports = mainRouter