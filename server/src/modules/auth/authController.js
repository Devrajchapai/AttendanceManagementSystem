require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const studentModel = require('../user/student.model')
const adminModel = require('../user/admin.model')
const teacherModel = require('../user/teacher.model')

class AuthController {

    login = async (req, res) => {
        const { email, password, role } = req.body

        if (!email || !password, !role) {
            return res.status(400).send({ error: "must provide email or password or role" });
        }



        if (role == 'student') {
            var user = await studentModel.findOne({ email })
        } else if (role === 'teacher') {
            var user = await teacherModel.findOne({ email })
        } else if (role === 'admin') {
            var user = await adminModel.findOne({ email })
        } else {
            res.status(300).send(`invalid data`)
        }

        if (!user) {
            return res.status(400).send({ error: "user doesn't exit" });
        }
        1
        try {
            const checkPassword = await bcrypt.compare(password, user.password)
            if (checkPassword) {
                const token = await jwt.sign({ userId: user._id, userRole: role }, process.env.JWT_PRIVATE_KEY)
                return res.status(200).send(token)

            } else {
                res.status(300).send("must provide correct information")
            }

        } catch (err) {
            res.status(400).send(`must provide email or password or role`)
        }
    }

    passwordChange = async (req, res) => {
        const { newPassword } = req.body
        const email = req.user.email
        const { role } = req.headers

        console.log(`role: ${role}    email: ${email}`)
        try {
            const newHashPassword = await bcrypt.hash(newPassword, 10)
            if (role == 'student') {
                var user = await studentModel.findOne({ email })
            } else if (role === 'teacher') {
                var user = await teacherModel.findOne({ email })
            } else if (role === 'admin') {
                var user = await adminModel.findOne({ email })
            } else {
                res.status(400).send(`something went wrong`)
            }


            const response = await user.updateOne({ password: newHashPassword })
            if (response.modifiedCount > 0) {
                res.status(200).send(`your password is updated`);
            } else {
                res.status(400).send(`password remains same`)
            }

        } catch (err) {
            res.status(400).send(`something went wrong, try again in a while`)
            console.log(err)
        }
    }

}

const authController = new AuthController();
module.exports = authController