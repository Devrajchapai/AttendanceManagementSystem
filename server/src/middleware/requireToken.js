require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = mongoose.model('User')

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

        const {userId} = payload
        const user = await userModel.findById(userId)
        req.user = user
        next()
    })

}