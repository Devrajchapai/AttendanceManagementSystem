const adminModel = require("../user/admin.model");
const teacherModel = require("../user/teacher.model");
const studentModel = require("../user/student.model");
const bcrypt = require("bcryptjs");
const nameOfweek = require('../../utlis/nameofweek')
const {hour, minutes, second} = require('../../utlis/millisecondToHour')
const hourToMillisecond = require('../../utlis/hourToMillisecond')
const currentTime = require('../../utlis/currentTime')

class AdminController {
  //------------------------------------------------- ADMIN ---------------------------------------------------------------------------

viewAdminProfile = async (req, res) => {
    // The _id is extracted from the decoded JWT token by the requireToken middleware
    const { _id } = req.user; 

    try {
        // Find the admin in the database by their ID
        const admin = await adminModel.findById(_id).select("-password"); // Exclude password for security

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Return the admin data
        res.status(200).json({ user: admin });
    } catch (err) {
        console.error("Error fetching admin profile:", err);
        res.status(500).json({ message: "Server error" });
    }
};

  // college location
  updateCollegeLocation = async (req, res) => {
    const { latitude, longitude, range } = req.body;
    const { _id } = req.user;

    try {
      const response = await adminModel.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            collegeLocation: {
              latitude,
              longitude,
              range,
            },
          },
        },
        { new: true, runValidators: true }
      );
      if (!response) {
        res.status(400).send(`failed to update college location`);
      }

      res.status(200).send(`location is updated sucessfully`+ response.collegeLocation);
    } catch (err) {
      console.log(err);
      res.status(`something went wrong`);
    }
  };

  viewCollegeLocation = async (req, res) => {
    const {_id} = req.user
    try{
      const response = await adminModel.findById({_id}, {collegeLocation: 1}, {new: true, runValidators: true})
      if(!response){
        res.status(400).send(`failed to retrive location`)
      }

      res.status(200).json({
        message: `retriving location`,
        data: response
      })
    }catch(err){
      console.log(err)
      res.status(400).send(`something went wrong`)
    }
  }


  //add and view courses
  updateCourses = async (req, res) => {
    const { listofCourses } = req.body;
    const { _id } = req.user;
    console.log(listofCourses);
    try {
      const response = await adminModel.findOneAndUpdate(
        { _id: _id },
        { $addToSet: { availableCourses: listofCourses } },
        { new: true, runValidators: true }
      );

      if (!response) {
        res.status(400).send(`failed to update course`);
      }

      res.status(200).send(`update successful`);
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  viewCourses = async (req, res) => {
    const { _id } = req.user;

    try {
      const response = await adminModel.findById(
        { _id },
        { availableCourses: 1 }
      );
      if (!response) {
        res.status(400).send(`failed to retrive courses`);
      }

      res.status(200).json({
        message: "avaliable courses retrived sucessfully",
        data: response,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  deleteCourses = async (req, res) => {
    const { _id } = req.user;
    const { courseToRemove } = req.body;

    try {
      const response = await adminModel.findOneAndUpdate(
        { _id },
        { $pullAll: { availableCourses: courseToRemove } },
        { new: true }
      );
      if (!response) {
        res.status(400).send(`failed to update courses`);
      }

      res.status(200).send(`course updated sucessfully`);
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  //retriving list of users
  retriveTeachers = async (req, res) => {
    try {
        const teacher = await teacherModel.find({});
        res.status(200).json(teacher); // Sending array directly
    } catch (err) {
        res.status(500).json({ message: "Error fetching teacher" });
    }
};


  retriveStudents = async (req, res) => {
    try {
        const students = await studentModel.find({});
        res.status(200).json(students); // Sending array directly
    } catch (err) {
        res.status(500).json({ message: "Error fetching students" });
    }
};

  //Routine for page
  updateSemesterRoutine = async (req, res) => {
    const { _id } = req.user;
    const { routine } = req.body;
    try {
      const admin = await adminModel.findOne({ _id: _id });
      admin.routine = routine;

      await admin.save();
      console.log(routine);
      res.json({
        message: "success",
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  todaysRoutine = async (req, res) => {
    try{
      const today = nameOfweek();

      const admin = await adminModel.findOne({ "username": "admin" });
      const todaysClasses = admin.routine.find(
        (day) => day.dayOfWeek === today
      );
      res.status(200).json({
        message: "updating today's routine ",
        data: todaysClasses
      });
    } catch (err) {
      console.log(err);
      res.status(400).send("something went wrong");
    }
  };

  viewRoutine = async (req, res) => {
    try {
        const { _id } = req.user;
        const admin = await adminModel.findById(_id);
        // Ensure we send the array directly or a consistent object
        res.status(200).json(admin.routine); 
    } catch (err) {
        res.status(500).json({ message: "Error fetching routine" });
    }
};
  // retrieve student account base on status
  pendingStatus = async (req, res) => {
    try {
      const response = await studentModel.find(
        { status: "pending" },
        { username: 1, status: 1 },
        { new: true },
        { sort: { username: 1 } }
      );
      if (!response) {
        res.status(400).send(`failed to retrieve pending accounts`);
      }

      res.status(200).json({
        message: "retrieve pending accounts",
        data: response,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  activeStatus = async (req, res) => {
    try {
      const response = await studentModel.find(
        { status: "active" },
        { username: 1, status: 1 },
        { new: true },
        { sort: { username: 1 } }
      );
      if (!response) {
        res.status(400).send(`failed to retrieve pending accounts`);
      }

      res.status(200).json({
        message: "retrieve active accounts",
        data: response,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  disableStatus = async (req, res) => {
    try {
      const response = await studentModel.find(
        { status: "disable" },
        { username: 1, status: 1 },
        { new: true },
        { sort: { username: 1 } }
      );
      if (!response) {
        res.status(400).send(`failed to retrieve pending accounts`);
      }

      res.status(200).json({
        message: "retrieve disable accounts",
        data: response,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  //---------------------------------------------TEACHER----------------------------------------------------------------------------------------------

  // create, update and view teacher
  registerTeacher = async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      res.status(400).send("incomplete information");
    }

    try {
      const hashPassword = await bcrypt.hash(password, 10);

      const teacher = new teacherModel({
        username,
        email,
        password: hashPassword,
        role,
        status: "active",
      });

      await teacher.save();
      res.status(200).send("new account created successfully");
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  updateTacherProfile = async (req, res) => {
    const user = req.params.userId;
    const {
      username,
      email,
      teacherId,
      status,
      mobileNumber,
      department,
      assignedSubjects,
    } = req.body;

    console.log(user);
    try {
      const response = await teacherModel.findOneAndUpdate(
        { _id: user },

        {
          $set: {
            username,
            email,
            teacherId,
            status,
            mobileNumber,
            department,
            assignedSubjects,
          },
        },

        { new: true, runValidators: true }
      );

      if (!response) {
        res.status(400).send("failed to update");
      }

      res.status(200).send(`update successfull`);
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  viewTeacherProfile = async (req, res) => {
    const user = req.params.userId;
    try {
      const teacher = await teacherModel.findById(user);
      if (!teacher) {
        res.status(400).send(`couldn't found ${user}`);
      }

      res.status(200).json({
        message: "retriving data",
        data: teacher,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  //asign course to teacher
  assignCourseToTecher = async (req, res) => {
    const { userId } = req.params;
    const { assignCourse } = req.body;

    try {
      const response = await teacherModel.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { assignedSubjects: assignCourse } },
        { new: true, runValidators: true }
      );

      if (!response) {
        res.status(400).json({ message: `failed to update` });
      }

      res.status(200).send(`course update sucessfully`);
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  removeCourseFromTeacher = async (req, res) => {
    const { userId } = req.params;
    const { removedCourse } = req.body;

    try {
      const response = await teacherModel.findOneAndUpdate(
        { _id: userId },
        { $pullAll: { assignedSubjects: removedCourse } },
        { new: true, runValidators: true }
      );

      if (!response) {
        res.status(400).send(`failed to remove ${removedCourse}`);
      }

      res.status(200).send(`${removedCourse} removed sucessfully`);
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  //--------------------------------------------------------------------STUDENT -----------------------------------------------------------------------------------------------------------------------------

  // create, update and view student
  registerStudent = async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      res.status(400).send("incomplete information");
    }

    try {
      const hashPassword = await bcrypt.hash(password, 10);
      const student = new studentModel({
        username,
        email,
        password: hashPassword,
        role,
        status: "active",
      });

      await student.save();
      res.status(200).json({message: "new account created successfully"});
    } catch (err) {
      console.log(err);
      res.status(400).json({message: `something went wrong`});
    }
  };

  updateStudentProfile = async (req, res) => {
    const user = req.params.userId;
    const {
      username,
      email,
      rollNo,
      symbolNo,
      studentId,
      phone,
      gender,
      nationality,
      DOB,
      status,
      guardianName,
      fatherName,
      fatherPhone,
      montherName,
      montherPhone,
      program,
      admittedBatch,
      currentClass,
      assignedSubjects,
    } = req.body;

    try {
      const response = await studentModel.findOneAndUpdate(
        { _id: user },
        {
          $set: {
            username,
            email,
            rollNo,
            symbolNo,
            studentId,
            phone,
            gender,
            nationality,
            DOB,
            status,
            guardianName,
            fatherName,
            fatherPhone,
            montherName,
            montherPhone,
            program,
            admittedBatch,
            currentClass,
            assignedSubjects,
          },
        },
        { new: true, runValidators: true }
      );

      if (!response) {
        res.status(400).send(`failed to update`);
      }

      res.status(200).send(`update successfull`);
    } catch (err) {
      console.log(`error: ${err}`);
      res.status(400).send(`something went wrong`);
    }
  };

  viewStudentProfile = async (req, res) => {
    const user = req.params.userId;

    try {
      const student = await studentModel.findById(user);

      if (!student) {
        res.status(400).send(`couldn't retrieve data`);
      }

      res.status(200).json({
        message: `retriving data`,
        data: student,
      });
    } catch (err) {}
  };

  // assign courses to student
  assignCourseToStudent = async (req, res) => {
    const { userId } = req.params;
    const { subjects } = req.body;
    try {
      const response = await studentModel.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { assignedSubjects: subjects } },
        { new: true, runValidators: true }
      );

      if (!response) {
        res.status(400).send(`failed to add ${subjects}`);
      }

      res.status(200).send(`${subjects} added sucessfully`);
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  removeCourseFromStudent = async (req, res) => {
    const { userId } = req.params;
    const { subjects } = req.body;

    try {
      const response = await studentModel.findByIdAndUpdate(
        { _id: userId },
        { $pullAll: { assignedSubjects: subjects } },
        { new: true, runValidators: true }
      );
      if (!response) {
        res.status(400).send(`failed to remove ${subjects}`);
      }

      res.status(200).send(`${subjects} removed sucessfully`);
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  // update student status
  updateStudentStatus = async (req, res) => {
    const { userId } = req.params;
    const { updatedStatus } = req.body;

    try {
      const response = await studentModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { status: updatedStatus } },
        { new: true, runValidators: true }
      );

      if (!response) {
        res.status(400).json({message:"failed to change status"});
      }

      res.status(200).json({message: `status changed to ${updatedStatus}`});
    } catch (err) {
      console.log(err);
      res.status(400).json({message:`something went wrong`});
    }
  };
}
const adminController = new AdminController();
module.exports = adminController;
