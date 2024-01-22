const mongoose = require('mongoose')
//import mongoose

const transactionSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    transactionAmount: {
        type: Number,
        required: true
    },
    transactionStatus: {
        type: String,
        enum: ["success", "failed", "pending"],
        required: true
    },
    transactionPaymentId: {
        type: String,
        required: false
    }
}, { 
    timestamps: true 
})

const Transaction = mongoose.model('Transaction', transactionSchema)
//create a model for transaction

module.exports = Transaction
//Export Transaction Model