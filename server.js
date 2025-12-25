const express = require('express')
const dotenv = require('dotenv').config()
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const connectToDb = require('./config/dbConnection')
require("./config/passport")

const passportLib = require("passport")
const response = require("./middleware/response")


const port = process.env.PORT || 3000;
const app = express();

// helmet is the security middleware top of the expressJS 
// It helps you app protect by setting variout http Header
app.use(helmet());


// morgan is the HTTP request logger middleware 
app.use(morgan("dev"))

// basic middlewares
app.use(cors({
    origin: (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean) || "*",
    credentials: true,
}))
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// middleware for custom response
app.use(response)


// passport middleware
app.use(passportLib.initialize());


// MongoDB connection
connectToDb();


// routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/doctor", require("./routes/doctor"))
app.use("/api/patient", require("./routes/patient"))


app.get("/health", (req, res) => res.ok({ time: new Date().toISOString() }, "ok"))


app.listen(port, () => {
    console.log(`Server Connected Successfully on : ${port}.`);
})