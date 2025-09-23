const mongoose = require('mongoose')

const teacher = mongoose.Schema({

    username: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: true,
    },

    password: {
        type: String,
        require: true
    },

     role:{
        type: String,
        default: 'teacher'
    },

    teacherId:{
        type: String,
        unique: true,
    },

    status:{
        type: String,
        enum: ['inactive', 'active', 'on leave']
    },

    mobileNumber: String,
    department: String,

    assignedSubjects: [String]


    
})

const teacherModel = mongoose.model('Teacher', teacher)
module.exports = teacherModel



