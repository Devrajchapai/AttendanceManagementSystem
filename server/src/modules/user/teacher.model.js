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
        type: Number,
    },

    profile: {
        data: Buffer,
        contentType: String,
    },
})

const teacherModel = mongoose.model('Teacher', teacher)
module.exports = teacherModel



