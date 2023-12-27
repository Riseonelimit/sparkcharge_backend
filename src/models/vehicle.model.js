const mongoose = require('mongoose');
//Import Mongoose

const vehicleSchema=new mongoose.Schema({
    uid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        //Reference to User Model
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: [true,"Vehicle already registered with this registration number!"],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{4}$/.test(v);
                //Regex to validate vehicle number
            },
            message: props => `${props.value} is not a valid vehicle number!`
        }
    },
    vehicleCompany: {
        type: String,
        required: [true,"Vehicle Company is required!"],
    }
},
{timestamps: true});
//Add createdAt and updatedAt fields automatically managed by Mongoose


const Vehicle=mongoose.model("Vehicle",vehicleSchema);
//Create Vehicle Model

module.exports = Vehicle;
//Export Vehicle Model