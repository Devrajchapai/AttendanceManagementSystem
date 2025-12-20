const mongoose = require("mongoose");

const student = mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: "student",
  },
  rollNo: Number,
  symbolNo: Number,
  studentId: {
    type: String,
    unique: true,
  },
  phone: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  nationality: String,
  DOB: String,
  status: {
    type: String,
    enum: ["disable", "active"],
  },
  guardianName: String,
  fatherName: String,
  fatherPhone: Number,
  motherName: String,
  motherPhone: Number,
  program: String,
  admittedBatch: Number,
  currentClass: String,
  assignedSubjects: [String],
  
  // --- NEW FIELD ADDED ---
  activeSubject: {
    type: String,
    default: "", // Stores the current subject name during an active session
  },

  dayAttendance: {
    date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "absent",
    },
  },
  subjectAttendance: [
    {
      subject: String,
      date: Date,
      time: Date, // Added time to track exactly when it was marked
      status: {
        type: String,
        enum: ["present", "absent"], // Updated to match controller logic
        default: "absent",
      },
    },
  ],
  workingDays: {
    type: Number,
    default: 0,
  },
  presentDays: {
    type: Number,
    default: 0,
  },
  attendanceStatus: Boolean,
});

const studentModel = mongoose.model("Student", student);
module.exports = studentModel;