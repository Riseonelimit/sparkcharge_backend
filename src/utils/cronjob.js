const Booking = require('../models/booking.model.js')
const Slot = require('../models/slot.model.js')
//const Station = require('../models/station.model.js')
//const User = require('../models/user.model.js')


const cronjob = async () =>{
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)
    const prevDay = new Date()
    prevDay.setDate(today.getDate() - 1)
    const timeslot = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
    try{
        const slots = await Slot.find({
            [`availableSlot.${prevDay.getDate()}`] : { $exists : true }
        }).select("id")
        
        if(slots.length > 0){
            const removeAvailableSlot = await Slot.updateMany({},{
                $unset: {
                    [`availableSlot.${prevDay.getDate()}`] : 1
                }
            })
        }
        //Delete Previous Day's Available Slot

        const checkTommorow = await Slot.find({
            [`availableSlot.${tomorrow.getDate()}`] : { $exists : false }
        }).select("id")
        if(checkTommorow.length > 0){
            const updateDay = await Slot.updateMany(checkTommorow._id,{
                $set: {
                    [`availableSlot.${tomorrow.getDate()}`] : timeslot
                }
            })
        }
        // Update Tomorrow's Available Slot if not present THIS SHOULD NEVER EXECUTE UNLESS
        // User fiddles with the database

        const checkDayAfterTommorow = await Slot.find({
            [`availableSlot.${dayAfterTomorrow.getDate()}`] : { $exists : false }
        }).select("id")
        if(checkDayAfterTommorow.length > 0){
            const updateDay = await Slot.updateMany(checkDayAfterTommorow._id,{
                $set: {
                    [`availableSlot.${dayAfterTomorrow.getDate()}`] : timeslot
                }
            })
        }
        //Adding Day After Tommorow's Available Slot

        const prevMonth = new Date()
        prevMonth.setDate(today.getDate()-30)
        const bookingCleanup = await Booking.deleteMany({
            bookingDate: {
                $lt: prevMonth
            }
        })
        //Delete Previous Month's Booking
        console.log("CRONJOB HAS BEEN EXECUTED at " + new Date())
    }catch(err){
        console.log(err)
    }
}
module.exports = cronjob