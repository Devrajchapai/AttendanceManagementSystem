const mongoose = require("mongoose");

const classSchema = mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
});

const dayRoutineSchema = mongoose.Schema({
    dayOfWeek: {
        type: String,
        required: true,
        enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    collegeStatus :{
      type: String,
      enum: ["open", "closed"],
      require: true
    },
    classes: {
        type: [classSchema],
    }
});


const admin = mongoose.Schema({
  username: {
    type: String,
    default: "admin",
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

  role: {
    type: String,
    default: "admin",
  },

  profile: {
    data: Buffer,
    contentType: String,
  },

  previousAdmins: [String],

  routine: [dayRoutineSchema],

  availableCourses : [{
    type: String,
    unique: true
  }],

  courseAssignToTeacher: [{
    course: String,
    assignedTeacher: String
  }],

  collegeLocation: {
    latitude : Number,
    longitude: Number,
    range: Number,
  },
  
});

const adminModel = mongoose.model("Admin", admin);
module.exports = adminModel;
