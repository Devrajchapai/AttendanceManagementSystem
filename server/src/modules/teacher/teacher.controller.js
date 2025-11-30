const mongoose = require ('mongoose')
const teacherModel = require('../user/teacher.model')
const studentModel = require('../user/student.model')
require('dotenv').config()
const passData = require('../../utlis/passData')
const studentController = require('../student/student.controller')
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

    takeAttendance = async(req, res)=>{
        const {currentSubject} = req.body;
        try{
            
            const students = await studentModel.find({assignedSubjects: currentSubject}, {_id: 1 } )

            
            passData.setData('currentSubject',currentSubject);
            students.forEach((id)=>{console.log(`${id._id}\n`)})
            
            students.forEach(async(id)=>{
                const student = await studentModel.findOneAndUpdate(
                    {_id: id}, 
                    {$set:{attendanceStatus: true}}, 
                )

                if(!student){
                    res.send('error')
                }
            })

            res.send(`notified for the attendance`)
        }catch(err){
            console.log(err);
            res.send(`failed to take attedance`)
        }
        

    }   
    
}

const teacherController = new TeacherController()
module.exports = teacherController