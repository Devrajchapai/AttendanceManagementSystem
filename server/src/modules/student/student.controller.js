const mongoose = require ('mongoose')
const studentModel = require ('../user/student.model')
require('dotenv').config()

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

}

const studentController = new StudentController()
module.exports = studentController