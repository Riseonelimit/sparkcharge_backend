const mongoose = require('mongoose');
//import mongoose
const bookedslotSchema = new mongoose.Schema({
    bookingDate: {
        type: Date,
        required: true
    },
    bookingTime: {
        type: Number,
        enum: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        required: true
    }
},{timestamps: false,_id: false});

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
    booking: {
        type: [bookedslotSchema],
        required: true,
        unique: true
    },
},{timestamps: true});

bookingSchema.index({ "booking.bookingDate": 1, "booking.bookingTime": 1 }, { unique: true });
//indexing bookingDate and bookingTime to make sure that no two bookings are made for the same slot

const Booking = mongoose.model("Booking", bookingSchema);
//create slots model

module.exports = Booking;
//export slots model