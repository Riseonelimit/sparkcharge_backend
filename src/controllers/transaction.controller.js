const Booking = require('../models/booking.model.js')
//Import Booking Model
const Transaction = require('../models/transaction.model.js')
//Import Transaction Model
const asyncHandler = require('../utils/asyncHandler.js')
//Import Async Handler from utils/asyncHandler.js
const apierror = require('../utils/apierror.js')
//Import API Error from utils/apierror.js
const apiresponse = require('../utils/apiresponse.js')
//Import API Response from utils/apiresponse.js
const Razorpay = require("razorpay")
//Import Razorpay
var razor_instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})
//Razorpay Instance
const hmac_sha256 = require('crypto-js/hmac-sha256')

const razorpaygenorder = asyncHandler(async(req,res,next) => {
    const {amount, receipt, bookingid} = req.body
    if([amount, receipt, bookingid].some((field)=>field === undefined || typeof field != 'string' || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const checkBooking = await Booking.findOne({
        _id: bookingid,
        uid: req.user._id
    })
    if(!checkBooking){
        throw new apierror(404,"Booking Not Found")
    }
    var options = {
        amount: parseInt(amount),
        currency: "INR",
        receipt: receipt
    }
    razor_instance.orders.create(options, async function(err, order) {
        //console.log(order);
        if(order === undefined || order === null){
            throw new apierror(500,"Failed to Generate Order ID")
        }
        const transaction = await Transaction.create({
            uid: req.user._id,
            bookingId: bookingid,
            transactionId: order.id,
            transactionAmount: order.amount,
            transactionStatus: "pending"
        })
        if(transaction === undefined || transaction === null){
            throw new apierror(500,"Failed to Create Transaction")
        }
        req.orderid = order.id
        res.status(200).json(new apiresponse(200,order.id,"Order ID Generated"))
    })
})

const verifyrazorsignature = asyncHandler(async(req,res) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body
    const fetchOrderObj = await Transaction.findOne({
        transactionId: razorpay_order_id,
        uid: req.user._id
    })
    let order_id
    if(fetchOrderObj){
        order_id = fetchOrderObj.transactionId
    }
    const generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, process.env.RAZORPAY_KEY_SECRET);
    if (generated_signature === razorpay_signature) {
        const updateTransaction = await Transaction.updateOne({
            transactionId: razorpay_order_id
        },{
            transactionStatus: "success",
            transactionPaymentId: razorpay_payment_id
        })
        if(!updateTransaction){
            throw new apierror(500,"Failed to Update Transaction")
        }
        res.status(200).json(
            new apiresponse(200,"","Payment Processed Successfully")
        )
    }
    console.log(req.user._id+" has tried malicious transaction spoofing!")
    throw new apierror(501,"Signature Verification Failed, This activity will be reported!")
})
module.exports = {
    razorpaygenorder,
    verifyrazorsignature
}