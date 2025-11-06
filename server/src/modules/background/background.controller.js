
const adminModel = require('../user/admin.model')
const teacherModel = require('../user/teacher.model')
const studentModel =require('../user/student.model') 
const nameofweek = require('../../utlis/nameofweek') 
class BackgroundRunner {

   //take attendance
   checkingCollegStatus = async() => {
    const _id = '68b2124eab19eb886c217fad'  //Admin's _id
    const todayIs = nameofweek()
    try{

        const admin = await adminModel.findById({_id}, {routine: 1, _id: 0})

        const todaysClasses = admin.routine.find((day)=>day.dayOfWeek === todayIs)
        
        if(todaysClasses.collegeStatus === 'open'){
            
        }

      console.log(todaysClasses)
    }catch(err){
        console.log(err)
    }

}




}

const backgroundRunner = new BackgroundRunner()
module.exports = backgroundRunner