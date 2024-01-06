const mongoose = require('mongoose')
//Import Mongoose
const stationSchema = new mongoose.Schema({
    sid: {
        type: mongoose.Schema.Types.UUID,
        ref: 'Station',
        //Reference to Station Model
    },
    station_name: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true,
        required: [true, "Station Name cannot be empty!"],
        minlength: [3, "Station Name must be at least 3 characters!"],
        maxlength: [32, "Station Name must be at most 32 characters!"]
    },
    city: {
        type: String,
        trim: true,
        uppercase: true,
        required: [true, "City cannot be empty!"],
        minlength: [3, "City must be at least 3 characters!"],
        maxlength: [32, "City must be at most 32 characters!"]
    },
    state: {
        type: String,
        trim: true,
        uppercase: true,
        required: [true, "State cannot be empty!"],
        minlength: [3, "State must be at least 3 characters!"],
        maxlength: [32, "State must be at most 32 characters!"]
    },
    manager: {
        type: [],
        required: false,
    }
},
{timestamps: true})
//Add createdAt and updatedAt fields automatically managed by Mongoose


const Station = mongoose.model("Station", stationSchema)
//Create Station Model

module.exports = Station
//Export Station Model