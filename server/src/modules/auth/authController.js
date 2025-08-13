require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../user/user.model')


class AuthController{

    signup = async(req, res )=>{

        const {email, password, role} = req.body;
        try{
            const hashPassword = await bcrypt.hash(password, 10)
                
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
1       
        try{
            const checkPassword = await bcrypt.compare(password, user.password)
            if(checkPassword){
                const token = await jwt.sign({userId: user._id}, process.env.JWT_PRIVATE_KEY)
                return res.status(200).send(token)

            }else{
                console.log("Wrong Password")
                res.status(300).send("must provide correct information")
            }

        }catch(err){
            res.status(402).send(`must provide email, password and role 3`)
        }
    }

     passwordChange = async (req, res) => {
        const {newPassword} = req.body
        const {token, email} = req.headers

        if(!token){
            res.status(403).send("Must be logged in to change password")
        }

        try{
            const newHashPassword = await bcrypt.hash(newPassword, 10)
            const user = userModel.findOne({email})
            const response = await user.updateOne({password: newHashPassword})
            if(response){
                res.status(200).send(`your password is changed`);
            }else{
                res.send("didn't change")
            }

        }catch(err){
            res.status(402).send(`something went wrong, try again in a while`)
            console.log(err)
        }
    }

}

const authController = new AuthController();
module.exports = authController