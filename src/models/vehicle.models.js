const mongoose = require('mongoose');

const vehicleSchema=new mongoose.Schema({
    uid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle1: {
        type: String,
        required: true,
        unique: [true,"Vehicle already registered with this registration number!"],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid vehicle number!`
        }
    },
    vehicle2: {
        type: String,
        unique: [true,"Vehicle already registered with this registration number!"],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid vehicle number!`
        }
    },
    vehicle3: {
        type: String,
        unique: [true,"Vehicle already registered with this registration number!"],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid vehicle number!`
        }
    }
},{timestamps: true}
);

const Vehicle=mongoose.model("Vehicle",vehicleSchema);

module.exports=Vehicle;