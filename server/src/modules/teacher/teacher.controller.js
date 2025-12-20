const mongoose = require ('mongoose')
const teacherModel = require('../user/teacher.model')
const studentModel = require('../user/student.model')
require('dotenv').config()
//const passData = require('../../utlis/passData')
const studentController = require('../student/student.controller')
const AttendanceSessionModel = require('../attendane/AttendanceSession.model')
const adminModel = require('../user/admin.model')
class TeacherController{

    updateProfile = async(req, res) =>{

        if(req.file){
            req.image = req.file.filename
        }

        try{
            res.json({
                message: "Profile updated successfully"
            })

        }catch(err){
            console.error("Profile update error:", err)
            res.status(500).send("failed to update profile")
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

   
takeAttendance = async (req, res) => {
    // 1. Only require currentSubject now
    const { currentSubject } = req.body; 

    if (!currentSubject) {
        return res.status(400).json({
            message: "Missing subject for attendance session.",
            status: false
        });
    }

    try {
        // 2. Fetch college location from admin settings for geofencing
        const adminSettings = await adminModel.findOne();
        if (!adminSettings || !adminSettings.collegeLocation) {
            return res.status(500).json({ message: "College location not configured." });
        }

        // 3. Create/Update the session based only on the subject
        await AttendanceSessionModel.findOneAndUpdate(
            { subject: currentSubject },
            { 
                subject: currentSubject,
                collegeLocation: adminSettings.collegeLocation,
                createdAt: new Date() 
            },
            { upsert: true }
        );

        // 4. Update all students taking this subject
        const updateResult = await studentModel.updateMany(
            { assignedSubjects: currentSubject }, 
            {
                $set: { 
                    attendanceStatus: true,
                    activeSubject: currentSubject // Store subject in student model
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
             return res.status(404).json({
                message: `No students found assigned to ${currentSubject}.`,
                status: false
            });
        }

        res.status(200).json({
            message: `Attendance session opened for ${currentSubject}.`,
            status: true,
            updatedCount: updateResult.modifiedCount
        });
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Server error.", status: false });
    }
}
    // takeAttendance = async(req, res)=>{
    //     const {currentSubject} = req.body;

    //     try{
    //         passData.setData('subject',currentSubject)
    //         res.json({message: `sended an notificaion for attendance`})

    //     }catch(err){
    //         console.log(err);
    //         res.send(`failed to take attedance`)
    //     }
    // }
}

const teacherController = new TeacherController()
module.exports = teacherController