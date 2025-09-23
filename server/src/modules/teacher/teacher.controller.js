const mongoose = require ('mongoose')
const teacherModel = require('../user/teacher.model')
require('dotenv').config()

class TeacherController{

    updateProfile = async(req, res) =>{

        if(req.file){
            req.image = req.file.filename
        }

        try{
            res.json({
                image_url: `http://localhost:${process.env.EXPRESS_PORT}/public/upload/teacher/${req.image}`
            })

        }catch(err){
            res.send("failed to upload")
        }
    }


    profile = async(req, res) =>{
        const {_id} = req.user
        try{
            const user = await teacherModel.findById({_id})
            res.json({
                user
            })
        }catch(err){
            res.send(`failed to extract data`)
        }
    }

    
}

const teacherController = new TeacherController()
module.exports = teacherController