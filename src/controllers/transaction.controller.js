const Booking = require('../models/booking.model.js')
//Import Booking Model
const { reserveamo, pickupndropamo } = require('../constant.js')
//Import Reserve and PickupnDrop Amount from constant.js
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
const Slot = require('../models/slot.model.js')
//Import Slot Model

var razor_instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})
//Razorpay Instance
const hmac_sha256 = require('crypto-js/hmac-sha256')

const razorpaygenorder = asyncHandler(async(req,res) => {
    let amount;
    if(req.pickupndrop == true){
        amount = reserveamo + pickupndropamo
    }else{
        amount = reserveamo
    }

    var options = {
        amount: parseInt(amount),
        currency: "INR",
        receipt: req.user._id,
    }
    razor_instance.orders.create(options, async function(err, order) {
        //console.log(order);
        if(order === undefined || order === null){
            throw new apierror(500,"Failed to Generate Order ID")
        }
        const transaction = await Transaction.create({
            uid: req.user._id,
            transactionId: order.id,
            transactionAmount: order.amount,
            transactionStatus: "pending",
            reservationData: {
                bookingDate: req.selectedDate,
                bookingTime: req.bookingTime,
                stationName: req.stationName,
                slotType: req.slotType,
                registrationNumber: req.registrationNumber,
                pickupndrop: req.pickupndrop,
                lockedslot: req.lockedslot
            }
        })
        if(transaction === undefined || transaction === null){
            throw new apierror(500,"Failed to Create Transaction")
        }
        setTimeout(async function(){
            disablelockin(transaction._id);
        }, 600000)
        res.status(200).json(new apiresponse(200,order.id,"Order ID Generated"))
    })
})

async function disablelockin(transactionid){
    const checkTransaction = await Transaction.findById(transactionid)
    if(!checkTransaction){
        console.log("Critical Server Error! Transaction not found!")
    }
    if(checkTransaction.transactionStatus === "pending"){
        const updateTransaction = await Transaction.updateOne(checkTransaction,{
            transactionStatus: "failed"
        })
        if(!updateTransaction){
            console.log("Critical Server Error! Failed to Update Transaction")
        }
        const lockedslot = checkTransaction.reservationData.lockedslot
        const lockeddate = checkTransaction.reservationData.bookingDate
        const lockedtimeslot = parseInt(checkTransaction.reservationData.bookingTime)
        const querySlot = await Slot.findOne({
            _id: lockedslot,
            [`availableSlot.${lockeddate}`]:{
                $in: [lockedtimeslot]
            }
        })
        if(!querySlot){
            const updateAvailSlot = await Slot.updateOne({
                _id: lockedslot
            },{
                $push:{
                    [`availableSlot.${lockeddate}`]: lockedtimeslot
                }
            })
            if(!updateAvailSlot){
                throw new apierror(500, "Critical Server Error! Failed to Unlock Slot")
                //This should never execute
            }
        }
    }
}

const verifyrazorsignature = asyncHandler(async(req,res) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body
    const fetchOrderObj = await Transaction.findOne({
        transactionId: razorpay_order_id,
        uid: req.user._id
    })
    if(fetchOrderObj.transactionPaymentId != undefined || fetchOrderObj.transactionPaymentId != null){
        throw new apierror(400, "Payment has been already proccessed!")
    }
    let order_id
    if(fetchOrderObj){
        order_id = fetchOrderObj.transactionId
    }
    const generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, process.env.RAZORPAY_KEY_SECRET).toString();
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
        const selectedDate = fetchOrderObj.reservationData.bookingDate
        const bookingTime = fetchOrderObj.reservationData.bookingTime
        const stationName = fetchOrderObj.reservationData.stationName
        const slotType = fetchOrderObj.reservationData.slotType
        const pickupndrop = fetchOrderObj.reservationData.pickupndrop
        const registrationNumber = fetchOrderObj.reservationData.registrationNumber
        const bookedslot = fetchOrderObj.reservationData.lockedslot
        const userid = fetchOrderObj.uid
        const reservation = await Booking.create({
            uid: userid,
            bookingDate: selectedDate,
            bookingTime: bookingTime,
            bookingSlotType: slotType,
            registrationNumber: registrationNumber,
            stationName: stationName,
            bookingSlotId: bookedslot,
            pickUpNDrop: pickupndrop
        })
        if(!reservation){
            throw new apierror(500,"Failed to Create Reservation")
        }
        return res.status(200).json(
            new apiresponse(200,reservation,"Payment Processed, Reservation Successful")
        )
        
    }
    console.log(req.user._id+" has tried malicious transaction spoofing!")
    throw new apierror(501,"Signature Verification Failed, This activity will be reported!")
})
module.exports = {
    razorpaygenorder,
    verifyrazorsignature
}