const mongoose = require ('mongoose')
const studentModel = require ('../user/student.model')
require('dotenv').config()
const passData = require('../../utlis/passData')
const adminModel = require('../user/admin.model')
const haversineDistance = require('../../utlis/calculateDistance')

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

    submitAttendance = async (req, res) => {
    const { studentLatitude, studentLongitude, subjectName } = req.body;
    const { id } = req.user; 

    if (!subjectName) {
        return res.status(400).json({ message: "Subject name is required to mark attendance." });
    }

    try {
        // 1. Get College Location Configuration
        const admin = await adminModel.findOne({ role: "admin" }, { collegeLocation: 1 });
        
        if (!admin || !admin.collegeLocation) {
            return res.status(500).json({ message: "College location configuration is missing." });
        }
        
        // Extract college's center and required radius (range)
        const { latitude, longitude, range } = admin.collegeLocation;
        
        // 2. Calculate Distance
        const distance = haversineDistance(
            latitude, longitude, 
            studentLatitude, studentLongitude
        );

        // 3. Check Boundary Condition
        if (distance > range) {
            const distanceOut = (distance - range).toFixed(2);
            return res.status(403).json({ 
                message: `You are out of the college boundary. You are ${distanceOut} km outside the required range of ${range} km.`
            });
        }
        
        // --- 4. Student IS IN RANGE: Mark Attendance ---
        
        // Retrieve current days to calculate increments
        const student = await studentModel.findById(id, { workingDays: 1, presentDays: 1 });
        
        if (!student) {
             return res.status(404).json({ message: "Student record not found." });
        }

        // Atomically update fields
        const newWorkingDays = student.workingDays + 1;
        const newPresentDays = student.presentDays + 1;

        // Use findOneAndUpdate to perform the update and return the new document
        const updatedStudent = await studentModel.findOneAndUpdate(
            { _id: id },
            { 
                // $set: {
                //     workingDays: newWorkingDays, 
                //     presentDays: newPresentDays,
                // },

                $push: { 
                    subjectAttendance: {
                        subject: subjectName,
                        date: new Date(),
                        status: "present", 
                    }
                }
            },
            { new: true, runValidators: true } 
        );

        return res.status(200).json({
            message: `Attendance marked successfully for ${subjectName}`
        });

    } catch (err) {
        console.error("Attendance submission error:", err);
        res.status(500).json({ message: "Something went wrong during attendance submission. Please check server logs." });
    }
    };

     attendaceHistory = async (req, res) => {
    // Extract the student ID from the authenticated user object
    const { id } = req.user; 

    try {
        // 1. Query the Student Model
        // Use findById and projection to retrieve only the required attendance fields.
        const history = await studentModel.findById(
            id,
            { 
                subjectAttendance: 1, 
                workingDays: 1, 
                presentDays: 1,
                _id: 0 // Exclude the document ID for cleaner output
            }
        );

        if (!history) {
            return res.status(404).json({ 
                status: false,
                message: "Student record not found." 
            });
        }

        // 2. Calculate Percentage (ensuring no division by zero)
        const totalWorkingDays = history.workingDays || 0;
        const presentDays = history.presentDays || 0;
        
        const attendancePercentage = totalWorkingDays > 0 
            ? ((presentDays / totalWorkingDays) * 100).toFixed(2)
            : "0.00";

        // 3. Format the response data
        res.status(200).json({
            status: true,
            message: "Attendance history retrieved successfully.",
            data: {
                summary: {
                    workingDays: totalWorkingDays,
                    presentDays: presentDays,
                    percentage: attendancePercentage
                },
                // Sort by date descending (most recent first) for display
                subjectDetails: history.subjectAttendance.sort((a, b) => b.date - a.date) 
            }
        });

    } catch (err) {
        console.error("Error retrieving attendance history for ID:", id, err);
        res.status(500).json({ 
            status: false,
            message: "Failed to load attendance history due to a server error." 
        });
    }
};


}

const studentController = new StudentController()
module.exports = studentController