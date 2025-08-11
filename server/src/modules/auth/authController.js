require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const userModel = require('../user/user.model')
const mongoose = require('mongoose');


const app = express();


const signup = async(req, res )=>{

    const {username, email, password} = req.body;
    try{
        const hashPassword = await bcryptjs.hash(password, 10)
            
        const user =  new userModel({
            username,
            email,
            password: hashPassword,
        })

        await user.save()

        const token = await jwt.sign({userId: user._id}, process.env.JWT_PRIVATE_KEY) 
        res.status(200).send(`Token: ${token}`)

    }catch(err){
        res.status(400).send(`Error: ${err}`)
    }
   
    
    
}


module.exports = signup