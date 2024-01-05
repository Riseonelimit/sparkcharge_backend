const mongoose = require('mongoose');
//import mongoose

//const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const slotsSchema = new mongoose.Schema({
    sid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    stationname: {
        type: String,
        required: true,
        uppercase: true
    },
    type: {
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
    availableSlot: {
        type: Object,
    },
},{timestamps: true});
//slotsSchema.plugin(mongooseAggregatePaginate);

const Slots = mongoose.model("Slots", slotsSchema);
//create slots model

module.exports = Slots;
//export slots model