const mongoose =  require('mongoose')

const student = mongoose.Schema({
    profile: {
        data: Buffer,
        contentType: String,
    },
    
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

    studentId:{
        type: Number,
        //unique: true
    },

    mobileNo:{
        type: Number,
    },

    gender:{
        type: String,
        enum: ['male', 'female'],
    },

    nationality: String,

    DOB: Date,

    status:{
        type: String,
        enum: ['disable', 'pending', 'active'],
    }, 
    

    guardianName: String,

    fatherName: String,

    fatherNumber: Number,

    motherName: String,

    motherNumber: Number,

    Program: String,

    admittedBatch: Number,

    currentClass: String,

    assignedSubjects: [String],
    
    attendance: [{
        key:{
            type: Date,
        },
        value:{
            type: String,
            enum: ["present", "absent"],
            default: "absent",
        },
    }],
    

})

const studentModel = mongoose.model('Student', student);
module.exports = studentModel
