const mongoose = require("mongoose");
const studentModel = require("../user/student.model");
require("dotenv").config();
//const passData = require("../../utlis/passData");
const adminModel = require("../user/admin.model");
const haversineDistance = require("../../utlis/calculateDistance");
const AttendanceSessionModel = require('../attendane/AttendanceSession.model')

class StudentController {
  updateProfile = async (req, res) => {
    if (req.file) {
      req.image = req.file.filename;
    }

    try {
      res.json({
        image_url:
          `http://localhost:${process.env.EXPRESS_PORT}/public/upload/student/` +
          req.image,
      });
    } catch (err) {
      res.send(`failed to extract data`);
    }
  };

  profile = async (req, res) => {
    const { _id } = req.user;
    try {
      const user = await studentModel.findById({ _id });
      res.json({ user });
    } catch (err) {
      res.send("failed to extract data");
    }
  };

  isAttendanceAvailable = async (req, res) => {
        const { _id: studentId } = req.user;
        const student = req.user; // req.user is the full student object from requireToken

        if (student.status !== 'active') {
            return res.status(403).json({ 
                status: false, 
                message: "Account inactive. Contact administration." 
            });
        }

        try {
            // 1. Check for active session matching the student's subjects/class
            const activeSession = await AttendanceSessionModel.findOne({
                subject: { $in: student.assignedSubjects },
                // Add more filters if needed (e.g., currentClass: student.currentClass)
            });

            if (!activeSession) {
                return res.status(200).json({
                    status: false,
                    message: "No attendance is currently active for your subjects.",
                    attendanceStatus: false,
                    subject: null,
                    location: null,
                });
            }

            // 2. Respond with the live session details
            res.status(200).json({
                status: true,
                message: `Attendance is available for ${activeSession.subject}.`,
                attendanceStatus: true, // This is now redundant but kept for existing client logic
                subject: activeSession.subject,
                location: activeSession.collegeLocation,
            });

        } catch (err) {
            console.error("Error in isAttendanceAvailable:", err);
            res.status(500).json({
                status: false,
                message: "Server error while checking attendance availability.",
            });
        }
    };

    submitAttendance = async (req, res) => {
        const { latitude, longitude } = req.body;
        const { _id: studentId, assignedSubjects } = req.user; // Get data from authenticated user

        try {
            // 1. Find the active attendance session
            const activeSession = await AttendanceSessionModel.findOne({
                subject: { $in: assignedSubjects }
            });

            if (!activeSession) {
                return res.status(400).json({ 
                    status: false, 
                    message: "Attendance window is closed or not started." 
                });
            }

            const { collegeLocation, subject: currentSubject } = activeSession;

            // 2. Perform Geofencing Check
            const distance = haversineDistance(
                latitude,
                longitude,
                collegeLocation.latitude,
                collegeLocation.longitude
            );

            if (distance > collegeLocation.range_km) {
                return res.status(403).json({
                    status: false,
                    message: `You are too far from the college location. Distance: ${distance.toFixed(2)} km.`,
                });
            }

            // 3. Mark attendance
            const date = new Date();
            const today = date.toISOString().split('T')[0];
            const attendanceTime = date;

            const updateResult = await studentModel.findOneAndUpdate(
                { _id: studentId },
                {
                    $set: { attendanceStatus: false }, // Reset status immediately
                    $push: {
                        subjectAttendance: {
                            subject: currentSubject,
                            date: today,
                            time: attendanceTime,
                            status: 'Present',
                        }
                    },
                    $inc: { 
                        workingDays: 1, 
                        presentDays: 1 
                    } // Increment counters
                },
                { new: true }
            );

            // Optional: End the session if it's based on a single student submission (not recommended)
            // await AttendanceSessionModel.findByIdAndDelete(activeSession._id);

            res.status(200).json({ 
                status: true, 
                message: `Attendance submitted successfully for ${currentSubject}.` 
            });

        } catch (err) {
            console.error("Error in submitAttendance:", err);
            res.status(500).json({ 
                status: false, 
                message: "Server error during attendance submission." 
            });
        }
    };

  attendaceHistory = async (req, res) => {
   
    const { id } = req.user;

    try {
      const history = await studentModel.findById(id, {
        subjectAttendance: 1,
        workingDays: 1,
        presentDays: 1,
        _id: 0, // Exclude the document ID for cleaner output
      });

      if (!history) {
        return res.status(404).json({
          status: false,
          message: "Student record not found.",
        });
      }

      // 2. Calculate Percentage (ensuring no division by zero)
      const totalWorkingDays = history.workingDays || 0;
      const presentDays = history.presentDays || 0;

      const attendancePercentage =
        totalWorkingDays > 0
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
            percentage: attendancePercentage,
          },
          // Sort by date descending (most recent first) for display
          subjectDetails: history.subjectAttendance.sort(
            (a, b) => b.date - a.date
          ),
        },
      });
    } catch (err) {
      console.error("Error retrieving attendance history for ID:", id, err);
      res.status(500).json({
        status: false,
        message: "Failed to load attendance history due to a server error.",
      });
    }
  };
}

const studentController = new StudentController();
module.exports = studentController;