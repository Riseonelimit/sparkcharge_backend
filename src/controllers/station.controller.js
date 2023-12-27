const Station = require('../models/station.model.js');
//Import Station Model
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
    const terminateStation = await Station.findByIdAndDelete(stationExists._id)
    if(!terminateStation){
        throw new apierror(500,"Trust Me Something seriously went wrong while terminating station!")
        //this should never execute
    }
    return res.status(200)
    .json(new apiresponse(200, {}, "Station Terminated Successfully!"))
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

module.exports ={
    addStation, 
    removeStation, 
    getStationByLocation
}
//Export Station Controller Functions