require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const mongoose = require('mongoose');
const userModel = require('../user/user.model')

const app = express();

class AuthController{

    signup = async(req, res )=>{

        const {email, password, role} = req.body;
        try{
            const hashPassword = await bcryptjs.hash(password, 10)
                
            const user =  new userModel({
                email,
                password: hashPassword,
                role,
            })

            await user.save()

            const token = await jwt.sign({userId: user._id}, process.env.JWT_PRIVATE_KEY) 
            res.status(200).send(`Token: ${token}`)

        }catch(err){
            res.status(400).send(`Error: ${err}`)
        }
    }

    login = async (req,res)=>{
        const {email, password, role} = req.body
        
        if(!email || !password || !role){
            return res.status(422).send({error: "must provide email or password or role 1"});
        }

        const user = await userModel.findOne({email, role})
        if(!user){
            return res.status(422).send({error: "must provide email or password or role 2"});
        }

        try{
            bcryptjs.compare(password, user.password)
            const token = await jwt.sign({userId: user._id}, process.env.JWT_PRIVATE_KEY)
            res.send({token})
        }catch(err){
            return res.status(422).send({error: "must provide email or password or role 3"})
        }

    }

    passwordChange = (req, res) => {
        const {newPassword} = req.body
        userModel({password: this.passwordChange})
    }

}

const authController = new AuthController();
module.exports = authController