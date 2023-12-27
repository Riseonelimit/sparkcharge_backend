const Booking = require('../models/booking.model.js');
//Import Booking Model from models/booking.model.js
const User=require('../models/user.model.js');
//Import User Model from models/user.model.js
const Vehicle = require('../models/vehicle.model.js');
//Import Vehicle Model from models/vehicle.model.js
const Slot = require('../models/slot.model.js');
//Import Slot Model from models/slot.model.js
const asyncHandler = require('../utils/asyncHandler.js');
//Import Async Handler from utils/asyncHandler.js
const apierror = require('../utils/apierror.js');
//Import API Error from utils/apierror.js
const apiresponse = require('../utils/apiresponse.js');
//Import API Response from utils/apiresponse.js
const reserve = asyncHandler(async (req, res) => {
    const {slotType, bookingDate, bookingTime, registrationNumber} = req.body;
    if([slotType, bookingDate, bookingTime, registrationNumber].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const selectedDate = new Date(bookingDate);
    // Check if the selected date is valid
    if (isNaN(selectedDate.getTime())) {
        throw new apierror(400, "Invalid date format!");
    }
    // Check if the selected date is not older than today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        throw new apierror(400, "Selected date cannot be older than today!");
    }
    if(bookingTime < 0 || bookingTime > 16){
        throw new apierror(400, "Invalid time slot!");
    }
    //Check if TimeSlot is valid
    const slot = await Slot.findOne({type:slotType});
    if(!slot){
        throw new apierror(400, "Specified Type of Slot is not available!");
    }
    //Check if the slot-type is available
    const vehicle = await Vehicle.findOne({registrationNumber: registrationNumber.toUpperCase()});
    if(!vehicle){
        throw new apierror(404, "Vehicle not found!");
    }
    const reservation = await Booking.create({
        uid:req.user._id,
        booking: {
            bookingDate: selectedDate,
            bookingTime: bookingTime
        },
        bookingSlot: slot._id,
        vehicleid: vehicle._id
    });
    if(!reservation){
        throw new apierror(500, "Something went wrong!");
    }
    res.status(201)
    .json(new apiresponse(201,reservation, "Reservation successful!"));
})
const cancelReservation = asyncHandler(async (req, res) => {
    const bookingId = req.body.bookingId;
    if(bookingId === undefined || bookingId.trim() === ""){
        throw new apierror(400, "Please fill all the fields!");
    }
    const reservation = await Booking.findOne({_id: bookingId, uid: req.user._id});
    if(!reservation){
        throw new apierror(404, "Reservation not found!");
    }
    const deletedReservation = await Booking.deleteOne({_id: bookingId, uid: req.user._id});
    if(!deletedReservation){
        throw new apierror(500, "Failed to terminate reservation!");
    }
    res.status(200)
    .json(new apiresponse(200, deletedReservation, "Reservation cancelled successfully!"));
})
module.exports ={
    reserve,
    cancelReservation,
}