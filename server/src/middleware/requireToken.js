require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const studentModel = mongoose.model('Student')
const teacherModel = mongoose.model('Teacher')
const adminModel = mongoose.model('Admin')

module.exports = (req, res, next)=>{
    const {authorization} = req.headers

    if(!authorization){
        res.status(401).send({error: "You must be logged in"})
    }

    const token = authorization.replace("Bearer ", "")

    jwt.verify(token, process.env.JWT_PRIVATE_KEY, async(err, payload)=>{
        if(err){
            res.status(401).send({error: "You must be logged in"})
        }

        const {userId, userRole} = payload
        if(userRole === 'student'){
            var userID = await studentModel.findById(userId)
        }else if(userRole === 'teacher'){
            var userID = await teacherModel.findById(userId)
        }else if(userRole === 'admin'){
            var userID = await adminModel.findById(userId)
        }else{
            res.status(300).send("invalid role")
        }
        
        req.user = userID
        next()
    })

}