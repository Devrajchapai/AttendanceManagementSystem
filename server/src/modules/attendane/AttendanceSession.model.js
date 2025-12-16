const mongoose = require('mongoose');

const attendanceSessionSchema = mongoose.Schema({
    // ID of the teacher who started the session
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    // The subject being taught
    subject: {
        type: String,
        required: true,
        trim: true
    },
    // Location and range fetched from AdminModel at session start
    collegeLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        range_km: { type: Number, required: true } // Geofencing range
    },
    // Timestamp when attendance window started
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Automatically delete this document 1 hour after creation (Adjust expiration time as needed)
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '60m' }, // TTL Index: Expires after 60 minutes
    }
});

// The Attendance Session model will be used by both student and teacher controllers
module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);