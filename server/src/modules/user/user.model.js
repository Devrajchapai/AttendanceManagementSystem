const mongoose =  require('mongoose')

const user = mongoose.Schema({
    username:{
        type: String,
        require: true,
    },

    email:{
        type: String,
        require: true,
        unique: true,
    },

    password:{
        type: String,
        require: true,
    },

    role: ['admin', 'teacher', 'student'],


})

const userModel = mongoose.model('User', user);
module.exports = userModel
