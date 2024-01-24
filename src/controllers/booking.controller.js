const Booking = require('../models/booking.model.js')
//Import Booking Model from models/booking.model.js
// const User=require('../models/user.model.js')
//Import User Model from models/user.model.js //YET TO BE USED
const Vehicle = require('../models/vehicle.model.js')
//Import Vehicle Model from models/vehicle.model.js
const Station = require('../models/station.model.js')
//Import Station Model from models/station.model.js
const Slot = require('../models/slot.model.js')
//Import Slot Model from models/slot.model.js
const asyncHandler = require('../utils/asyncHandler.js')
//Import Async Handler from utils/asyncHandler.js
const apierror = require('../utils/apierror.js')
//Import API Error from utils/apierror.js
const apiresponse = require('../utils/apiresponse.js')
//Import API Response from utils/apiresponse.js

const reserve = asyncHandler(async (req, res, next) => {
    const {stationName, slotType, bookingDate, bookingTime, registrationNumber, pickupndrop} = req.body
    if([stationName, slotType, bookingDate, bookingTime, registrationNumber].some((field)=>field === undefined || typeof field != 'string' || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    if(pickupndrop === undefined || typeof pickupndrop != 'boolean' || pickupndrop === null){
        throw new apierror(400,"PickUpNDrop should be boolean!")
    }
    const selectedDate = new Date(bookingDate)
    const today = new Date()
    const todayy = new Date()
    const bookDay = selectedDate.getDate()
    // Check if the selected date is valid
    if (isNaN(selectedDate.getTime())) {
        throw new apierror(400, "Invalid date format!")
    }
    // Check if the selected date is not older than today
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
        throw new apierror(400, "Booking date cannot be earlier than today!")
    }
    if(bookingTime < 1 || bookingTime > 16){
        throw new apierror(400, "Invalid time slot!")
    }
    //Check if TimeSlot is valid
    function getPassedTime(bT){
        switch(bT){
            case 1:
                return "0:00"
            case 2:
                return "1:30"
            case 3:
                return "3:00"
            case 4:
                return "4:30"
            case 5:
                return "6:00"
            case 6:
                return "7:30"
            case 7:
                return "9:00"
            case 8:
                return "10:30"
            case 9:
                return "12:00"
            case 10:
                return "13:30"
            case 11:
                return "15:00"
            case 12:
                return "16:30"
            case 13:
                return "18:00"
            case 14:
                return "19:30"
            case 15:
                return "21:00"
            case 16:
                return "22:30"
        }
    }
    function compareTime(time1, time2){
        const [hours1, minutes1] = time1.split(":").map(Number)
        const totalMinutes1 = hours1 * 60 + minutes1
        const [hours2, minutes2] = time2.split(":").map(Number)
        const totalMinutes2 = hours2 * 60 + minutes2
        if (totalMinutes1 > totalMinutes2) {
            return 1 // Bookingtime is later
        } else if (totalMinutes1 < totalMinutes2) {
            return 0 // Bookingtime is earlier
        } else {
            return 0 // both times are equal
        }
    }
    if(todayy.getDate() == selectedDate.getDate()){
        const hours = todayy.getHours()
        const minutes = todayy.getMinutes()
        const currentTime = `${hours}:${minutes}`
        const bookTime = getPassedTime(parseInt(bookingTime))
        if(compareTime(bookTime, currentTime) == 0){
            throw new apierror(400, "Booking Time has already passed!")
        }
    }
    //Check if Booking Time has already Passed
    const checkStation = await Station.findOne({
        station_name:stationName
    })
    if(!checkStation){
        throw new apierror(400, "Station not found!")
    }
    //Check if the station exists
    const checkVehicle = await Vehicle.findOne({
        registrationNumber: registrationNumber.toUpperCase()
    })
    if (!checkVehicle) {
        throw new apierror(400, "Vehicle not found!")
    }
    if (checkVehicle.uid.toString() !== req.user._id.toString()) {
        throw new apierror(400, "Vehicle not registered to this user!")
    }
    
    const availSlot = await Slot.findOne({
        sid:checkStation._id,
        type:slotType.toUpperCase(),
        [`availableSlot.${bookDay}`]:{
            $in: [parseInt(bookingTime)]
        }
    })
    if(!availSlot){
        throw new apierror(400, "Sorry! Specified Slot is not Available")
    }
    //Check if the slot is available
    const updateAvailSlot = await Slot.findByIdAndUpdate(availSlot._id,{
        $pull:{
            [`availableSlot.${bookDay}`]: parseInt(bookingTime)
        }
    })
    if(!updateAvailSlot){
        throw new apierror(500, "Failed to update slot! Contact Administrator")
        //This should never execute
    }
    req.stationName = stationName
    req.slotType = slotType
    req.bookingDate = bookDay
    req.bookingTime = bookingTime
    req.registrationNumber = registrationNumber
    req.pickupndrop = pickupndrop
    req.lockedslot = updateAvailSlot._id
    req.selectedDate = selectedDate
    next()
    // const reservation = await Booking.create({
    //     uid:req.user._id,
    //     bookingDate: selectedDate,
    //     bookingTime: bookingTime,
    //     bookingSlotType: availSlot.type,
    //     registrationNumber: checkVehicle.registrationNumber,
    //     stationName: checkStation.station_name,
    //     bookingSlotId: availSlot._id,
    //     pickUpNDrop: pickupndrop
    // })
    // res.status(201)
    // .json(new apiresponse(201,reservation, "Reservation successfull!"))
    // if(!reservation){
    //     throw new apierror(500, "Something went terribly wrong! Please try again later! Contact Administrator")
    // }
})

const cancelReservation = asyncHandler(async (req, res) => {
    const bookingId = req.body.bookingId
    if(bookingId === undefined || typeof bookingId != 'string' || bookingId.trim() === ""){
        throw new apierror(400, "Please fill all the fields!")
    }
    const reservation = await Booking.findOne({
        _id: bookingId, 
        uid: req.user._id
    })
    if(!reservation){
        throw new apierror(404, "Reservation not found / is not linked to this user!")
    }
    if(reservation.bookingDate < new Date()){
        throw new apierror(400, "Cannot cancel past reservations!")
    }
    const querySlot = await Slot.findOne({
        _id: reservation.bookingSlot,
        [`availableSlot.${reservation.bookingDate.getDate()}`]:{
            $in: [reservation.bookingTime]
        }
    })
    if(!querySlot){
        const updateAvailSlot = await Slot.updateOne({
            _id: reservation.bookingSlot
        },{
            $push:{
                [`availableSlot.${reservation.bookingDate.getDate()}`]: reservation.bookingTime
            }
        })
        if(!updateAvailSlot){
            throw new apierror(500, "Failed to update slot! Contact Administrator")
            //This should never execute
        }
    }
    //AVOIDING DUPLICATE ENTRIES IN AVAILABLESLOT

    const deletedReservation = await Booking.deleteOne({
        _id: bookingId, 
        uid: req.user._id
    })
    if(!deletedReservation){
        throw new apierror(500, "Failed to terminate reservation!")
    }
    res.status(200)
    .json(new apiresponse(200, deletedReservation, "Reservation cancelled successfully!"))
})

const getUserBooking = asyncHandler(async (req, res) => {
    const email = req.user.email
    const bookings = await Booking.find({
        uid: req.user._id
    })
    if(bookings.length === 0 || !bookings){
        throw new apierror(404, "No bookings found!")
    }
    res.status(200)
    .json(new apiresponse(200, bookings, "Bookings found!"))
})

module.exports ={
    reserve,
    cancelReservation,
    getUserBooking
}