const User=require('../models/user.model.js');
//Import User Model from models/user.model.js
const Vehicle = require('../models/vehicle.model.js');
//Import Vehicle Model from models/vehicle.model.js
const asyncHandler = require('../utils/asyncHandler.js');
//Import Async Handler from utils/asyncHandler.js
const apierror = require('../utils/apierror.js');
//Import API Error from utils/apierror.js
const apiresponse = require('../utils/apiresponse.js');
//Import API Response from utils/apiresponse.js
const jwt = require('jsonwebtoken');
//Import JWT fronm jsonwebtoken

const registerUser = asyncHandler(async (req, res) => {
    const {name,email,phone,password} = req.body
    //Get name, email, phone and password from request body
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //Regex to validate email
    const phoneRegex = /^\d{10}$/;
    //Regex to validate phone number
    const passwordRegex = /^(?=.*[a-zA-Z\d]).{8,}$/;
    //Regex to validate password

    if([name,email,phone,password].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }

    if(emailRegex.test(email) === false){
        //If email is invalid
        throw new apierror(400,"Please enter a valid email!")
    }

    if(phoneRegex.test(phone) === false){
        //If phone number is invalid
        throw new apierror(400,"Please enter a valid phone number!")
    }

    if(passwordRegex.test(password) === false){
        //If password is invalid
        throw new apierror(400,"Please enter a valid password!")
    }

    const Useralreadyexists = await User.findOne({
        //Check if user already exists
        $or: [{email}, {phone}]
    })

    if(Useralreadyexists){
        throw new apierror(409,"User account already exists!")
    }

    const user = await User.create({
        //Create new user
        name,
        email: email.toLowerCase(),
        //Convert email to lowercase
        phone,
        password
    })

    const createdUser = await User.findById(user._id).select(
        //Find user by id and exclude password and refreshToken fields
        "-password -refreshToken"
    )

    if(!createdUser){
        //If user is not created
        throw new apierror(500,"Error creating user!")
    }

    return res.status(201).json(
        //Return success response
        new apiresponse(200,createdUser,"User registered successfully!")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, password}= req.body;
    //Get email and password from request body
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //Regex to validate email

    if([email,password].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }

    if(emailRegex.test(email) === false){
        //If email is invalid
        throw new apierror(400,"Please enter a valid email!")
    }

    const user = await User.findOne({email:email.toLowerCase()})
    //Find user by email

    if(!user){
        //If user does not exists
        throw new apierror(401,"User Account does not exists!")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    //Check if password is correct
    if(!isPasswordValid){
        throw new apierror(401,"Incorrect Password!")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    //Generate access and refresh tokens by calling generateAccessAndRefreshTokens function

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    //Find user by id and exclude password and refreshToken fields

    const options= {
        //Set cookie options
        httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
        secure: process.env.COOKIE_SECURE === 'true'
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new apiresponse(200,{
        user: loggedInUser, accessToken, refreshToken
    },
    "User logged in successfully!")
    )
})

const generateAccessAndRefreshTokens = async(userID)=>{
    try{
        const user = await User.findById(userID)
        //Find user by id
        const accessToken = user.generateAccessToken()
        //Generate access token
        const refreshToken = user.generateRefreshToken()
        //Generate refresh token

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        //Save refresh token to database

        return {accessToken,refreshToken}
    }catch(err){
        throw new apierror(500,"Error generating tokens!")
    }
}

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,{
        //Find user by id and update refreshToken to undefined
        $set: {
            refreshToken: undefined
        }
    },{
        new: true
        //Return updated user
    })
    const options= {
        //Set cookie options
        httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
        secure: process.env.COOKIE_SECURE === 'true'
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiresponse(200,{},"User logged out successfully!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        //Get refresh token from cookies or request body

        if(!incomingRefreshToken){
            throw new apierror(400,"Unauthorized Request!")
        }
        const decodedToken = jwt.verify(
            //Verify refresh token
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
        const user = await User.findById(decodedToken?._id)
        //Find user by id
    
        if(!user){
            throw new apierror(401,"Invalid Refresh Token!")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            //If incoming refresh token does not match with the one in database
            throw new apierror(401,"Refresh Token is Expired!")
        }
        const options= {
            //Set cookie options
            httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
            secure: process.env.COOKIE_SECURE === 'true'
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
        //Generate new access and refresh tokens by calling generateAccessAndRefreshTokens function
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(new apiresponse(200,{
            accessToken, refreshToken: newrefreshToken
        },"Access Token Refreshed Successfully!"))
    } catch (error) {
        throw new apierror(401,"Invalid Refresh Token!")
    }
})

const deleteAccount = asyncHandler(async (req, res) => {
    const terminationconfirmpass = req.body.terminationconfirmpass
    if(terminationconfirmpass === undefined || (terminationconfirmpass?.trim() === "")){
        //If password is undefined or empty
        throw new apierror(400,"Please enter your password to confirm termination!")
    }
    //Get password from request body
    const user = await User.findById(req.user._id)
    const isPasswordValid = await user.isPasswordCorrect(terminationconfirmpass)
    //Check if password is correct
    if(!isPasswordValid){
        //If password is incorrect
        throw new apierror(401,"Incorrect Password! Termination Aborted!")
    }
    const terminateAccount = await User.findByIdAndDelete(req.user._id)
    if(!terminateAccount){
        //If user is not found
        throw new apierror(500,"Trust Me Something seriously went wrong while termination!")
        //this should never execute
    }
    //Find user by id and delete
    return res.status(200)
    .json(new apiresponse(200,{},"User Account Terminated Successfully!"))
})

const changePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword, confirmNewPassword} = req.body
    //Get old password and new password from request body
    const passwordRegex = /^(?=.*[a-zA-Z\d]).{8,}$/;
    //Regex to validate password

    if([oldPassword,newPassword,confirmNewPassword].some((field)=>field === undefined || (field?.trim() === ""))){
        //If any of the fields are undefined or empty
        throw new apierror(400,"Please fill all the fields!")
    }
    if(newPassword !== confirmNewPassword){
        //If new password and confirm new password do not match
        throw new apierror(400,"New Password and Confirm New Password do not match!")
    }
    if(passwordRegex.test(newPassword) === false){
        //If password is invalid
        throw new apierror(400,"Please enter a valid password!")
    }

    const user = await User.findById(req.user._id)
    //Find user by id
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    //Check if password is correct
    if(!isPasswordValid){
        //If password is incorrect
        throw new apierror(401,"Incorrect Password!")
    }
    user.password = newPassword
    //Set password to new password
    await user.save({validateBeforeSave: false})
    //Save user
    return res.status(200)
    .json(new apiresponse(200,{},"Password changed successfully!"))
})
const getUserVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.find({uid: req.user._id})
    //Find vehicle by id
    if(vehicle === undefined || vehicle.length === 0){
        //If vehicle is not found
        throw new apierror(404,"Vehicle not found!")
    }
    return res.status(200)
    .json(new apiresponse(200,vehicle,"Vehicle found successfully!"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
    .json(new apiresponse(200,req.user,"User found successfully!"))
})
const addVehicle = asyncHandler(async (req, res) => {
    const {registrationNum, company} = req.body
    //Get registration number from request body
    const vehicleRegex = /^[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{4}$/
    //Regex to validate vehicle number
    if(registrationNum === undefined || (registrationNum?.trim() === "")){
        //If vehicle number is undefined or empty
        throw new apierror(400,"Received null/undefined vehicle number!")
    }
    if(vehicleRegex.test(registrationNum) === false){
        //If vehicle number is invalid
        throw new apierror(400,"Please enter a valid vehicle number!")
    }
    const vehicleAlreadyExists = await Vehicle.findOne({
        //Check if vehicle already exists
        $or: [{registrationNumber: registrationNum}]
    })
    if(vehicleAlreadyExists){
        //If vehicle already exists
        throw new apierror(409,"Vehicle is already registered!")
    }
    const vehicle = await Vehicle.create({
        //Create new vehicle
        uid: req.user._id,
        registrationNumber: registrationNum,
        vehicleCompany: company
    })
    return res.status(201).json(
        //Return success response
        new apiresponse(200,vehicle,"Vehicle registered successfully!")
    )
})
const deleteVehicle = asyncHandler(async (req, res) => {
    const registrationNum = req.body.registrationNumber
    if(registrationNum === undefined || (registrationNum?.trim() === "")){
        //If vehicle number is undefined or empty
        throw new apierror(400,"Received null/undefined vehicle number!")
    }
    const vehicleExists = await Vehicle.findOne({
        //Check if vehicle exists and Delete
        $or: [{registrationNumber: registrationNum}]
    })
    if(!vehicleExists){
        throw new apierror(404,"Vehicle not found!")
    }
    if(vehicleExists.uid.toString() !== req.user._id.toString()){
        //If vehicle does not belong to user
        throw new apierror(401,"Unauthorized Request!")
    }
    const finalterminatevehicle = await Vehicle.findOneAndDelete({
        //Find vehicle by id and delete
        $or: [{registrationNumber: registrationNum}]
    })
    if(!finalterminatevehicle){
        //If vehicle is not found
        throw new apierror(500,"Trust Me Something seriously went wrong while vehicle termination!")
        //this should never execute
    }
    return res.status(200)
    .json(new apiresponse(200,{},"Vehicle Deleted Successfully!"))
})
const promoteAdmin = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    if(!isAdmin){
        //If not an admin
        throw new apierror(403, "You are not authorized to access this route!")
    }
    const email = req.body.email
    if(email === undefined || (email?.trim() === "")){
        //If email is undefined or empty
        throw new apierror(400,"Received null/undefined email!")
    }
    const emailexists = await User.findOne({
        //Check if email exists
        $or: [{email: email}]
    })
    if(!emailexists){
        //If email does not exists
        throw new apierror(404,"User Account does not exists!")
    }
    if(emailexists.isAdmin){
        //If user is already an admin
        throw new apierror(409,"User is already an admin!")
    }
    const makeAdmin = await User.findByIdAndUpdate(emailexists,{
        //Find user by id and make admin true
        $set: {
            isAdmin: true
        }
    },{
        new: true
        //Return updated user
    })
    if(!makeAdmin){
        //If user is not found
        throw new apierror(500,"Trust Me Something seriously went wrong while making user admin!")
        //this should never execute
    }
    return res.status(200)
    .json(new apiresponse(200,makeAdmin,"User Promoted to Admin Successfully!"))
})
const demoteAdmin = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    if(!isAdmin){
        //If not an admin
        throw new apierror(403, "You are not authorized to access this route!")
    }
    const email = req.body.email
    if(email === undefined || (email?.trim() === "")){
        //If email is undefined or empty
        throw new apierror(400,"Received null/undefined email!")
    }
    const emailexists = await User.findOne({
        //Check if email exists
        $or: [{email: email}]
    })
    if(!emailexists){
        //If email does not exists
        throw new apierror(404,"User Account does not exists!")
    }
    if(!emailexists.isAdmin){
        //If user is already an admin
        throw new apierror(409,"User is not an admin!")
    }
    if(email===req.user.email){
        //If user is trying to demote himself
        throw new apierror(409,"You cannot demote yourself!")
    }
    const remAdmin = await User.findByIdAndUpdate(emailexists,{
        //Find user by id and make admin true
        $set: {
            isAdmin: false
        }
    },{
        new: true
        //Return updated user
    })
    if(!remAdmin){
        //If user is not found
        throw new apierror(500,"Trust Me Something seriously went wrong while making user admin!")
        //this should never execute
    }
    return res.status(200)
    .json(new apiresponse(200,remAdmin,"Admin demoted Successfully!"))
})
const getUserSlug = asyncHandler(async (req, res) => {
    const slug = req.params.slug
    if(slug === undefined || (slug?.trim() === "")){
        //If slug is undefined or empty
        throw new apierror(400,"Received null/undefined slug!")
    }
    if(req.user.isAdmin == true){
        const user = await User.findOne({
            //Check if user exists
            $or: [{_id: slug}]
        }).select("-password -refreshToken")
        if(!user){
            //If user is not found
            throw new apierror(404,"User not found!")
        }
        return res.status(200).json(
            //Return success response
            new apiresponse(200,user,"User found successfully!")
        )
    }
    if(req.user._id.toString()==slug){
        const user = await User.findOne({
            //Check if user exists
            $or: [{_id: slug}]
        }).select("-password -refreshToken")
        if(!user){
            //If user is not found
            throw new apierror(404,"Something has gone Terribly Wrong!")
            //this should not execute
        }
        return res.status(200).json(
            //Return success response
            new apiresponse(200,user,"User found successfully!")
        )
    }
    throw new apierror(403,"Unauthorized Request!")
})
module.exports = {
    registerUser,
    loginUser,
    logoutUser, 
    refreshAccessToken, 
    deleteAccount, 
    changePassword, 
    getUserVehicle, 
    addVehicle, 
    deleteVehicle, 
    getCurrentUser, 
    promoteAdmin,
    demoteAdmin,
    getUserSlug
}
//Export User Controller Functions