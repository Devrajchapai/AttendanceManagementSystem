require('dotenv').config()
const express = require('express');
require('./src/config/config.mongoose')
const mainRouter = require('./src/config/config.routes')

const app = express();

const PORT =  process.env.EXPRESS_PORT;

app.use(express.json())
app.use(mainRouter)

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT} 😻😻😻`);
})