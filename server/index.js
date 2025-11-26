require('dotenv').config()
const express = require('express');
require('./src/config/config.mongoose')
const mainRouter = require('./src/config/config.routes')
const requireToken = require('./src/middleware/requireToken')
const app = express();


const PORT =  process.env.EXPRESS_PORT;

require('./src/modules/user/student.model')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static('public'))

app.use(mainRouter)



app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT} 😻😻😻`);
})