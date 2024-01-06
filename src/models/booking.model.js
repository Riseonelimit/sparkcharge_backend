const mongoose = require('mongoose')
//import mongoose

const bookingSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookingSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        required: true
    },
    vehicleid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    bookingTime: {
        type: Number,
        enum: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        required: true
    }
},{timestamps: true})

const Booking = mongoose.model("Booking", bookingSchema)
//create slots model

module.exports = Booking
//export slots model