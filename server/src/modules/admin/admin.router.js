const express = require('express')
const mainRouter = express.Router()


const requireToken = require('../../middleware/requireToken')

const adminController = require('./admin.controller')

//---------------------------------------------Admin Routes----------------------------------------------------------------------------

// college location
mainRouter.post('/updateCollegeLocation', requireToken, adminController.updateCollegeLocation)
mainRouter.get('/viewCollegeLocation', requireToken, adminController.viewCollegeLocation)


//retrive teacher and student info
mainRouter.get('/retriveTeachers', requireToken, adminController.retriveTeachers)
mainRouter.get('/retriveStudents', requireToken, adminController.retriveStudents)



//update and view class routine
mainRouter.post('/updateSemesterRoutine', requireToken, adminController.updateSemesterRoutine)
mainRouter.get('/todaysRoutine',requireToken, adminController.todaysRoutine)
mainRouter.get('/viewRoutine', requireToken, adminController.viewRoutine )


//Courses
mainRouter.patch('/updateCourses', requireToken, adminController.updateCourses)
mainRouter.get('/viewCourses', requireToken, adminController.viewCourses)
mainRouter.delete('/deleteCourses', requireToken, adminController.deleteCourses)


// student account status
mainRouter.get('/pendingStatus', requireToken, adminController.pendingStatus)
mainRouter.get('/activeStatus', requireToken, adminController.activeStatus)
mainRouter.get('/disableStatus', requireToken, adminController.disableStatus)


//--------------------------------------------Teacher Routes-------------------------------------------------------------------------
mainRouter.post('/registerTeacher', requireToken ,adminController.registerTeacher)
mainRouter.put('/updateTeacherProfile/:userId', requireToken, adminController.updateTacherProfile)
mainRouter.get('/viewTeacherProfile/:userId', requireToken, adminController.viewTeacherProfile)


//assigning and removing courses
mainRouter.patch('/assignCourseToTecher/:userId', requireToken, adminController.assignCourseToTecher)
mainRouter.delete('/removeCourseFromTeacher/:userId', requireToken, adminController.removeCourseFromTeacher)



//------------------------------------------------Student Routes---------------------------------------------------------------------
mainRouter.post('/registerStudent', requireToken, adminController.registerStudent)
mainRouter.put('/updateStudentProfile/:userId',requireToken, adminController.updateStudentProfile)
mainRouter.get('/viewStudentProfile/:userId', requireToken, adminController.viewStudentProfile)



//assign and remove courses
mainRouter.patch('/assignCourseToStudent/:userId', requireToken, adminController.assignCourseToStudent)
mainRouter.delete('/removeCourseFromStudent/:userId', requireToken, adminController.removeCourseFromStudent)



// update student status
mainRouter.patch('/updateStudentStatus/:userId', requireToken, adminController.updateStudentStatus)



module.exports = mainRouter