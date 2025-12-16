const mongoose = require ('mongoose')
const teacherModel = require('../user/teacher.model')
const studentModel = require('../user/student.model')
require('dotenv').config()
//const passData = require('../../utlis/passData')
const studentController = require('../student/student.controller')
const AttendanceSessionModel = require('../attendane/AttendanceSession.model')

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

   takeAttendance = async(req, res) => {
    // 1. Destructure all required fields, including currentClass
    const { currentSubject, currentClass } = req.body; 
    
    // 1b. Validation check
    if (!currentSubject || !currentClass) {
        return res.status(400).json({
            // Improved error message
            message: "Missing subject or class for attendance session.",
            status: false
        });
    }

    try{
        // 2. Find all students assigned to the subject (Optional: find the whole document if needed)
        // Note: For efficiency, we will use updateMany instead of find then individual updates.
        
        // --- OPTIONAL: Setting global session data (if you need it elsewhere) ---
        // if (passData) {
        //     passData.setData('currentSubject', currentSubject);
        //     passData.setData('currentClass', currentClass); 
        // }

        // 3. Batch Update: Use updateMany for massive efficiency gains.
        // This command finds ALL students assigned to the currentSubject and updates their attendanceStatus in one single database operation.
        const updateResult = await studentModel.updateMany(
            { 
                assignedSubjects: currentSubject,
                // Optional: You might want to filter by class/semester too if students in different classes have the same subject name
                // currentClass: currentClass 
            }, 
            {
                // Set the attendanceStatus flag to true, indicating they can now submit attendance
                $set: { attendanceStatus: true }
            }
        );

        // Check if any students were updated
        if (updateResult.modifiedCount === 0) {
             return res.status(404).json({
                message: `No students found assigned to subject: ${currentSubject}.`,
                status: false
            });
        }

        // 4. Send a proper JSON success response
        res.status(200).json({
            message: `Attendance session opened for ${currentSubject} (${currentClass}). ${updateResult.modifiedCount} students notified.`,
            status: true,
            updatedCount: updateResult.modifiedCount
        });
    } catch(err) {
        console.error("Attendance Start Error:", err);
        
        // 5. Send a proper JSON error response
        res.status(500).json({
            message: `Failed to start attendance session due to a server error.`,
            status: false
        });
    }
  }
}

const teacherController = new TeacherController()
module.exports = teacherController