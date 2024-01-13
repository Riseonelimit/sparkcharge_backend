const Slot = require('../models/slot.model.js')
const apierror = require('./apierror.js')

const populateSlot = async (stationid) =>{
    const today = new Date()
    //today.setDate(today.getDate()+1)
    const tommorow = new Date(today)
    tommorow.setDate(tommorow.getDate() + 1)
    const dayAfterTommorow = new Date(today)
    dayAfterTommorow.setDate(today.getDate() + 2)
    const timeslot = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
    try{
        await Slot.findByIdAndUpdate(stationid,{
            availableSlot: {[today.getDate()]:timeslot,[tommorow.getDate()]:timeslot,[dayAfterTommorow.getDate()]:timeslot}
        })
    }catch(err){
        throw new apierror(500, "Failed to populate slot")
    }
}
module.exports = populateSlot