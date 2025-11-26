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

    isAttendanceAvailable = async(req, res)=>{
        const {_id} = req.user;
       try{
        const student = await studentModel.findById({_id}, {attendanceStatus: 1})
        const currentSubject=  passData.getData('currentSubject');

        if(student.attendanceStatus)
            res.status(200).json({
                message:`Take the attendance for the ${currentSubject} class`,
                attendanceStatus: true
        })

        if(!student.attendanceStatus){
            res.status(200).json({
                attendanceStatus: false
            })
        }
        }catch(err){
            console.log(err)
            res.status(400).send(`server-side error`)
       }
    }

}

const studentController = new StudentController()
module.exports = studentController