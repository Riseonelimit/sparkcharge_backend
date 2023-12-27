const Station = require('../models/station.model.js');
//Import Station Model
const Slot = require('../models/slot.model.js');
//Import Slot Model
const asyncHandler = require('../utils/asyncHandler.js');
//Import Async Handler from utils/asyncHandler.js
const apierror = require('../utils/apierror.js');
//Import API Error from utils/apierror.js
const apiresponse = require('../utils/apiresponse.js');
//Import API Response from utils/apiresponse.js

const addStation = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    if(!isAdmin){
        //If not an admin
        throw new apierror(403, "You are not authorized to access this route!")
    }
    const { station_name, city, state} = req.body;
    if([station_name, city, state].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const stationExists = await Station.findOne({station_name: station_name.toUpperCase()});
    if(stationExists){
        //If station already exists
        throw new apierror(409, "Station already exists!")
    }else{
        const station = await Station.create({
            station_name: station_name.toUpperCase(),
            city: city.toUpperCase(),
            state: state.toUpperCase()
        });
        if(!station){
            //If station is not created
            throw new apierror(500, "Failed to Create Station!")
        }
        return res.status(201)
        .json(new apiresponse(201, station , "Station Created Successfully!"))
    }
})

const addSlot = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    if(!isAdmin){
        //If not an admin
        throw new apierror(403, "You are not authorized to access this route!")
    }
    const { station_name, type } = req.body;
    if([station_name, type].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const stationExists = await Station.findOne({station_name: station_name.toUpperCase()});
    if(!stationExists){
        //If station does not exist
        throw new apierror(404, "Station does not exist!")
    }
    const createSlot = await Slot.create({
        sid: stationExists._id,
        stationname: station_name.toUpperCase(),
        type: type.toUpperCase()
    });
    if(!createSlot){
        //If slot is not created
        throw new apierror(500, "Failed to Create Slot!")
    }
    return res.status(201)
    .json(new apiresponse(201, createSlot , "Slot Created Successfully!"))
})

const removeSlot = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    if(!isAdmin){
        //If not an admin
        throw new apierror(403, "You are not authorized to access this route!")
    }
    const { station_name, type } = req.body;
    if([station_name, type].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const deleteSlot = await Slot.findOneAndDelete({
        stationame: station_name.toUpperCase(),
        type: type.toUpperCase()
    });
    if(!deleteSlot){
        //If slot is not deleted
        throw new apierror(500, "Failed to Delete Slot!")
    }
    return res.status(200)
    .json(new apiresponse(200, deleteSlot , "Slot Deleted Successfully!"))
})

const removeStation = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    if(!isAdmin){
        //If not an admin
        throw new apierror(403, "You are not authorized to access this route!")
    }
    const station_name = req.body.station_name;
    if([station_name].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const stationExists = await Station.findOne({station_name: station_name.toUpperCase()});
    if(!stationExists){
        //If station does not exist
        throw new apierror(404, "Station does not exist!")
    }
    const terminateSlot = await Slot.deleteMany({sid: stationExists._id})
    const terminateStation = await Station.findByIdAndDelete(stationExists._id)
    if(!terminateStation){
        throw new apierror(500,"Trust Me Something seriously went wrong while terminating station!")
        //this should never execute
    }
    return res.status(200)
    .json(new apiresponse(200, {}, "Station & Child Slots Terminated Successfully!"))
})

const getStationByLocation = asyncHandler(async (req, res) => {
    const { city, state } = req.body;
    if([city, state].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const stations = await Station.find({city: city.toUpperCase(), state: state.toUpperCase()});
    if(!stations){
        //If station does not exist
        throw new apierror(404, "No Stations Found!")
    }
    return res.status(200)
    .json(new apiresponse(200, stations, "Stations Found!"))
})

const getStationSlotByLocation = asyncHandler(async (req, res) => {
    const { city, state } = req.body;
    const slotarray = [];
    if([city, state].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const stations = await Station.find({city: city.toUpperCase(), state: state.toUpperCase()});
    if (stations.length === 0) {
        //If station does not exist
        throw new apierror(404, "No Stations Found!");
    }
    
    for (let i = 0; i < stations.length; i++) {
        const slots = await Slot.find({sid: stations[i]._id});
        const stationSlots = slots.map((slotmap) => ({
            station: slotmap.stationname,
            slots: slotmap.type,
        }));
        slotarray.push({
            station: stations[i].station_name,
            slots: stationSlots
        })
        //*scream cries* IDK How it works but it works
    }
    
    if(slotarray.length === 0){
        //If slots does not exist
        throw new apierror(404, "No Slots Found!")
    }
    return res.status(200)
    .json(new apiresponse(200,slotarray, "Slots Found!"))
})

const getSlotByStation = asyncHandler(async (req, res) => {
    const station_name  = req.body.station_name;
    if([station_name].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    const station = await Station.findOne({station_name: station_name.toUpperCase()});
    if(!station){
        //If station does not exist
        throw new apierror(404, "Station does not exist!")
    }
    const slots = await Slot.find({sid: station._id});
    if(!slots){
        //If slots does not exist
        throw new apierror(404, "No Slots Found!")
    }
    return res.status(200)
    .json(new apiresponse(200,slots, "Slots Found!"))
})

module.exports ={
    addStation, 
    removeStation, 
    getStationByLocation,
    addSlot,
    removeSlot,
    getStationSlotByLocation,
    getSlotByStation
}
//Export Station Controller Functions