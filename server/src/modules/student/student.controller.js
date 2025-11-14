const mongoose = require ('mongoose')
const studentModel = require ('../user/student.model')
require('dotenv').config()
const passData = require('../../utlis/passData')
const teacherController = require('../teacher/teacher.controller')


class StudentController{

    updateProfile = async(req, res) =>{
            if(req.file){
            req.image = req.file.filename
            }

        try{
            res.json({
                image_url: `http://localhost:${process.env.EXPRESS_PORT}/public/upload/student/`+ req.image
            })
        }catch(err){
            res.send(`failed to extract data`)
        }
        
        
    }

    profile = async(req, res) =>{
            const {_id} = req.user
            try{
                const user = await studentModel.findById({_id})
                res.json({user})
            }catch(err){
                res.send('failed to extract data')
            }

    }

    submitAttedance = async(req, res)=>{
       try{
           const currentSubject =  passData.getData('subject')
           

           
       }catch(err){
        console.log(err)
       }
    }

}

const studentController = new StudentController()
module.exports = studentController