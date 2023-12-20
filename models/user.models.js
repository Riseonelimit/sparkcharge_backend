const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uid:{
        type: Schema.Types.UUID,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, "Name cannot be empty!"],
        minlength: [3, "Name must be at least 3 characters!"],
        maxlength: [64, "Name must be at most 64 characters!"],
        validator: function (v) {
            return /^[a-zA-Z ]+$/.test(v);
        }
    },
    email: {
        type: String,
        required: [true, "Email cannot be empty!"],
        maxlength: [64, "Email must be at most 64 characters!"],
        unique: [true,"Account already exists with this email address!"],
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`
        }
    },
    phone: {
        type: String,
        required: [true, "Phone cannot be empty!"],
        unique: [true,"Account already exists with this phone number!"],
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`
        },
    },
    password: {
        type: String,
        required: [true, "Password cannot be empty!"],
        minlength: [8, "Password must be at least 8 characters!"],
        maxlength: [64, "Password must be at most 64 characters!"],
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid password!`,
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},{timestamps: true}
);
export const User = mongoose.model("User", userSchema);
