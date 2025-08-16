const express = require('express')
const mongoose = require ('mongoose')
const studentModel = require ('../user/student.model')

class StudentController{

    updateProfile = async(req, res) =>{
        const {_id} = req.user
       
    }

    profile = async(req, res) =>{
        const {_id} = req.user
        try{
            const user = await studentModel.findById({_id})
            res.send(user)
        }catch(err){
            res.send(`failed to extract data`)
        }
        

    }

}

const studentController = new StudentController()
module.exports = studentController