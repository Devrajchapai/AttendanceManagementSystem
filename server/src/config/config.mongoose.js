require('dotenv').config();
const mongoose = require('mongoose');


 mongoose.connect(process.env.MONGOOSE_DB_URL).then(()=>{
    console.log("Connected to Database Successfully ✔️ ✔️ ✔️")
}).catch((err)=>{
    console.log("❌ ❌ ❌ Failed to Connect with Database");
    console.log(`ERROR: ${err}`)
})