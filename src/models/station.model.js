const mongoose = require('mongoose');
const stationSchema = new mongoose.Schema({
    sid: {
        type: Schema.Types.UUID,
        ref: 'Station',
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: [true, "City cannot be empty!"],
        minlength: [3, "City must be at least 3 characters!"],
        maxlength: [32, "City must be at most 32 characters!"]
    },
    state: {
        type: String,
        required: [true, "State cannot be empty!"],
        minlength: [3, "State must be at least 3 characters!"],
        maxlength: [32, "State must be at most 32 characters!"]
    }
},{timestamps: true});

const Station = mongoose.model("Station", stationSchema);

module.exports = Station;