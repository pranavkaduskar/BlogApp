const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();


const app =  express();


const users = require('./routes/api/users');
const articles = require('./routes/api/articles');
const {checkToken} = require('./middlewares/auth');


const mongoUri =   `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;
mongoose.connect(mongoUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify:false   
})

app.use(bodyParser.json());
app.use(checkToken);
app.use("/api/users",users);
app.use("/api/articles",articles);
const port = process.env.PORT ||  3001;

app.listen(port,()=>{
    console.log( `Server is running on port ${port}`) ;
})