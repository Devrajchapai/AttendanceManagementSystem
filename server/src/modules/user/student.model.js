const mongoose =  require('mongoose');
const { type } = require('os');

const student = mongoose.Schema({
 
    username:{
        type: String,
        require: true,
    },

    email:{
        type: String,
        require: true,
        unique: true,
    },

    password:{
        type: String,
        require: true,
    },

    role:{
        type: String,
        default: 'student'
    },

    rollNo: Number,
    
    symbolNo: Number,

    studentId:{
        type: String,
        unique: true
    },

    phone:{
        type: Number,
    },

    gender:{
        type: String,
        enum: ['male', 'female'],
    },

    nationality: String,

    DOB: String,

    status:{
        type: String,
        enum: ['disable', 'pending', 'active'],
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
    
    dayAttendance: {
        date:{
            type: Date,
        },
        status:{
            type: String,
            enum: ["present", "absent"],
        },
    },

    subjectAttendance:[{
        subject: String,
        date: Date,
        status:{
            type: String,
            enum: ["present", "absent"],
        },

    }],

    workingDays: {
        type: Number,
        default: 0,
    },

    presentDays: {
        type: Number,
        default: 0,
    },

})

const studentModel = mongoose.model('Student', student);
module.exports = studentModel
