const asyncHandler = require("../utils/asyncHandler");
//Import Async Handler from utils/asyncHandler.js
const apierror = require("../utils/apierror");
//Import API Error from utils/apierror.js
const jwt = require("jsonwebtoken");
//Import JWT fronm jsonwebtoken
const User = require("../models/user.model");
//Import User Model from models/user.model.js
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        //Get Access Token from cookies or Authorization header

        if(!token){
            //If no token is found
            throw new apierror(401,"Unauthorized! Please login to continue!")
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        //Verify Access Token
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        //Find user by id and exclude password and refreshToken fields

        if(!user){
            //If no user is found
            throw new apierror(401,"Invalid Access Token!")
        }

        req.user = user;
        //Set req.user to user
        next()
        //Call next middleware
    } catch (error) {
        throw new apierror(401, error?.message || "Invalid Access Token!")
    }
})


module.exports = {verifyJWT}
//Export JWT Verification Middleware