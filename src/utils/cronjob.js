const Slot = require('../models/slot.model.js');
const Station = require('../models/station.model.js');
const User = require('../models/user.model.js');


const cronjob = async () =>{
    const today = new Date();
    //today.setDate(today.getDate()+1);
    const tommorow = new Date(today);
    tommorow.setDate(tommorow.getDate() + 1);
    const dayAfterTommorow = new Date(today);
    dayAfterTommorow.setDate(today.getDate() + 2);
    const prevDay = new Date();
    prevDay.setDate(today.getDate() - 1);
    const timeslot = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
    try{
        const slots = await Slot.find({
            [`availableSlot.${prevDay.getDate()}`] : { $exists : true }
        }).select("id");
        
        if(slots.length > 0){
            console.log(slots);
            const removeAvailableSlot = await Slot.updateMany({},{
                $unset: {
                    [`availableSlot.${prevDay.getDate()}`] : 1
                }
            })
        }
        //Delete Previous Day's Available Slot

        // const addAvailableSlot = await Slot.updateMany({},{
        //         availableSlot: {[today.getDate()]:timeslot,[tommorow.getDate()]:timeslot,[dayAfterTommorow.getDate()]:timeslot}
        // });
        const updateDay = await Slot.updateMany(slots._id,{
            $set: {
                [`availableSlot.${dayAfterTommorow.getDate()}`] : timeslot
            }
        })
        //Adding Day After Tommorow's Available Slot

        // const checkArrayLength = await Slot.find({
        //     [`availableSlot.${today.getDate()}`]: { $size: 16 }
        // }).select("id");
        // console.log(checkArrayLength)
        // if(checkArrayLength.length > 0){
        //     console.log("Array is already filled");
        //     return;
        // }
           
    }catch(err){
        console.log(err);
    }
}
module.exports = cronjob;