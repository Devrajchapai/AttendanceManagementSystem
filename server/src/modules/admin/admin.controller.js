require("dotenv").config();
const adminModel = require("../user/admin.model");
const teacherModel = require("../user/teacher.model");
const studentModel = require("../user/student.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AdminController {
  //-------------------------------------------------ADMIN---------------------------------------------------------------------------

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

  //asign course to teacher
  assignCourseToTecher = async (req, res) => {
    const { userId } = req.params
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

  removeCourseFromTeacher = async(req, res) =>{

  }

  //retriving list of users
  retriveTeachers = async (req, res) => {
    try {
      const listOfTeachers = await teacherModel.find(
        {},
        { username: 1 },
        { sort: { username: 1 } }
      );

      if (!listOfTeachers) {
        res.status(404).send(`couldn't retrive ...`);
      }

      res.status(200).json({
        message: "retriving data",
        data: listOfTeachers,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send("something went wrong");
    }
  };

  retriveStudents = async (req, res) => {
    try {
      const listofStudents = await studentModel.find(
        {},
        { username: 1 },
        { sort: { username: 1 } }
      );

      if (!listofStudents) {
        res.status(404).send(`couldn't retrive data`);
      }

      res.status(200).json({
        message: "retriving data",
        data: listofStudents,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
    }
  };

  //Routing for page
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
    const nameOfweek = () => {
      const date = new Date();
      const todayInNum = date.getDay();

      switch (todayInNum) {
        case 0:
          return "sunday";

        case 1:
          return "monday";

        case 2:
          return "tuesday";

        case 3:
          return "wednesday";

        case 4:
          return "thursday";

        case 5:
          return "friday";

        case 6:
          return "saturday";
      }
    };

    try {
      const today = nameOfweek();

      const admin = await adminModel.findOne({ username: "admin" });
      const todaysClasses = admin.routine.find(
        (day) => day.dayOfWeek === today
      );

      res.status(200).json({
        message: "updating today's routine ",
        data: todaysClasses,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send("something went wrong");
    }
  };

  //---------------------------------------------TEACHER----------------------------------------------------------------------------------------------

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
        status: "inactive",
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

  //--------------------------------------------------------------------STUDENT -----------------------------------------------------------------------------------------------------------------------------

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
        status: "pending",
      });

      await student.save();
      res.status(200).send("new account created successfully");
    } catch (err) {
      console.log(err);
      res.status(400).send(`something went wrong`);
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
}
const adminController = new AdminController();
module.exports = adminController;
