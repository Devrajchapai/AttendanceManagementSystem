const mongoose = require('mongoose')

const admin = mongoose.Schema({
    username: {
        type: String,
        default: "admin",
    },

    email:{
        type: String,
        require: true,
        unique: true,
    },

    password: {
        type: String,
        require: true,
    },

     role:{
        type: String,
        default: 'admin'
    },

    profile: {
        data: Buffer,
        contentType: String,
    },
})

const adminModel = mongoose.model('Admin', admin)
module.exports = adminModel