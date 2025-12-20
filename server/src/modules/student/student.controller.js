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
    // 1. Get ONLY the ID from the token (req.user)
    const { _id: studentId } = req.user; 

    try {
        // 2. Fetch the full student document from the DB to get the current 'activeSubject'
        const student = await studentModel.findById(studentId);

        if (!student || !student.activeSubject || student.attendanceStatus === false) {
            return res.status(200).json({
                status: false,
                message: "No active attendance session found.",
                attendanceStatus: false
            });
        }

        // 3. Find the session details using the subject found in the student's record
        const activeSession = await AttendanceSessionModel.findOne({
            subject: student.activeSubject
        });

        res.status(200).json({
            status: true,
            message: `Attendance available for ${student.activeSubject}.`,
            subject: student.activeSubject,
            location: activeSession?.collegeLocation,
        });
    } catch (err) {
        res.status(500).json({ status: false, message: "Server error." });
    }
};



 submitAttendance = async (req, res) => {
    const { latitude: studentLat, longitude: studentLon } = req.body;
    const { _id: studentId } = req.user;

    try {
        // 1. Retrieve the student and their active subject
        const student = await studentModel.findById(studentId);
        if (!student || !student.activeSubject) {
            return res.status(400).json({ status: false, message: "No active session for you." });
        }

        const currentSubject = student.activeSubject;

        // 2. Fetch the College location and range defined by Admin
        const admin = await adminModel.findOne({ username: "admin" });
        if (!admin || !admin.collegeLocation) {
            return res.status(500).json({ status: false, message: "College location not configured." });
        }

        const { latitude: collegeLat, longitude: collegeLon, range } = admin.collegeLocation;

        // 3. Calculate distance using Haversine formula
        const distanceInKm = haversineDistance(studentLat, studentLon, collegeLat, collegeLon);
        const distanceInMeters = distanceInKm * 1000;

        // 4. Determine Status based on Geofencing
        const isWithinRange = distanceInMeters <= range;
        const attendanceStatusLabel = isWithinRange ? 'present' : 'absent';

        // 5. Update Database and CLEAR the active session
        // Note: We only increment 'presentDays' if they are actually 'Present'
        const updateFields = {
            $set: { 
                attendanceStatus: false,
                activeSubject: "" 
            },
            $push: {
                subjectAttendance: {
                    subject: currentSubject,
                    date: new Date(),
                    time: new Date(),
                    status: attendanceStatusLabel, // Dynamically set to 'Present' or 'Absent'
                }
            },
            $inc: { workingDays: 1 } // Total classes conducted increases regardless
        };

        if (isWithinRange) {
            updateFields.$inc.presentDays = 1; // Only increment if they were in range
        }

        await studentModel.updateOne({ _id: studentId }, updateFields);

        // 6. Response
        if (isWithinRange) {
            res.status(200).json({ status: true, message: "Attendance marked as Present." });
        } else {
            res.status(200).json({ 
                status: true, 
                message: `Marked as Absent. You were ${Math.round(distanceInMeters)}m away from campus.` 
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: "Submission failed." });
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