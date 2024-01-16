const express = require("express")
//Import Express
const cors= require("cors")
//Import Cross Origin Resource Sharing (CORS)
const cookieParser = require("cookie-parser")
//Import Cookie Parser
const app = express()
//Create Express App
const morgan = require('morgan')
//Import Morgan for Logging
const cron = require('node-cron')
//Execute daily tasks
const cronjob = require('./utils/cronjob.js')

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    //Origin of Request
    credentials: true
}))
app.use(express.json({
//Express Body Parser with limit
    limit: "64kb"
}))
app.use(express.urlencoded({
//Express URL Encoded Parser with limit
    extended: true,
    limit: "64kb"
}))
app.use(express.static("public"))
//Express Static Directory
app.use(cookieParser())
//Express Cookie Parser
app.use(morgan('dev'))
//Express Morgan Logger

cron.schedule('15 0 * * *', () => {
    //execute daily at 3am
    cronjob()
}, {
    timezone: "Asia/Kolkata"
})
const userRouter = require("./routes/user.routes.js")
const stationRouter = require("./routes/station.routes.js")
const bookingRouter = require("./routes/booking.routes.js")
//Import User, Station, Booking Routes from user.routes.js

app.use("/api/v1/user", userRouter)
app.use("/api/v1/station", stationRouter)
app.use("/api/v1/booking", bookingRouter)
//Routes Declaration

module.exports = app
//Export Express App