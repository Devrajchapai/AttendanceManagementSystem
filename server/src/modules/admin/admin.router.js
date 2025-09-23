const express = require('express')
const mainRouter = express.Router()


const requireToken = require('../../middleware/requireToken')

const adminController = require('./admin.controller')

//---------------------------------------------Admin Routes----------------------------------------------------------------------------
//retrive teacher and student info
mainRouter.get('/retriveTeachers', requireToken, adminController.retriveTeachers)
mainRouter.get('/retriveStudents', requireToken, adminController.retriveStudents)


//assigning and removing courses
mainRouter.post('/assignCourseToTecher/:userId', requireToken, adminController.assignCourseToTecher)
mainRouter.delete('/removeCourseFromTeacher/:userId', requireToken, adminController.removeCourseFromTeacher)


//update and view class routine
mainRouter.post('/updateSemesterRoutine', requireToken, adminController.updateSemesterRoutine)
mainRouter.get('/todaysRoutine',requireToken, adminController.todaysRoutine)



//Courses
mainRouter.post('/updateCourses', requireToken, adminController.updateCourses)
mainRouter.get('/viewCourses', requireToken, adminController.viewCourses)
mainRouter.delete('/deleteCourses', requireToken, adminController.deleteCourses)





//--------------------------------------------Teacher Routes-------------------------------------------------------------------------
mainRouter.post('/registerTeacher', requireToken ,adminController.registerTeacher)
mainRouter.put('/updateTeacherProfile/:userId', requireToken, adminController.updateTacherProfile)
mainRouter.get('/viewTeacherProfile/:userId', requireToken, adminController.viewTeacherProfile)





//------------------------------------------------Student Routes---------------------------------------------------------------------
mainRouter.post('/registerStudent', requireToken, adminController.registerStudent)
mainRouter.put('/updateStudentProfile/:userId',requireToken, adminController.updateStudentProfile)
mainRouter.get('/viewStudentProfile/:userId', requireToken, adminController.viewStudentProfile)

module.exports = mainRouter