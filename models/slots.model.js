const mongoose = require('mongoose');
const bookedslotSchema = new mongoose.Schema({
    bdate: {
        type: Date,
        required: true,
    },
    bslot: {
        type: string,
        enum: ["0003","0306","0609","0912","1215","1518","1821","2124"],
        required: true
    }
});
const slotsSchema = new mongoose.Schema({
    sid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true,
    },
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bookedslot: {
        type: [bookedslotSchema],
        required: true,
        unique: true
    }
},{timestamps: true});

export const Slots = mongoose.model("Slots", slotsSchema);