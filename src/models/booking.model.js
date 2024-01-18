const mongoose = require('mongoose')
//import mongoose

const bookingSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookingSlotType: {
        type: String,
        enum: [
            "DC-CCS1",
            "DC-CCS2",
            "DC-CHADEMO",
            "DC-GB/T",
            "AC-Type1",
            "AC-Type2",
            "AC-IEC",
            "AC-BHARATAC001",
            "DC-BHARATDC001",
            "HYBRID-TESLA",
        ],
        required: true,
        uppercase: true
    },
    registrationNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{4}$/.test(v)
                //Regex to validate vehicle number
            },
            message: props => `${props.value} is not a valid vehicle number!`
        }
    },
    stationName: {
        type: String,
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