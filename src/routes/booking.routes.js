const{ 
    reserve,
    cancelReservation,
} = require('../controllers/booking.controller.js');
//Import User Controller from user.controller.js

const { verifyJWT } = require('../middlewares/auth.middleware.js');
//Import JWT Verification Middleware from auth.middleware.js

const Router = require('express').Router;
//Import Express Router
const router = Router();
//Create Router

router.route("/reserve").post(verifyJWT, reserve)
//Booking Secure Route
router.route("/cancel-reservation").post(verifyJWT, cancelReservation)
//Cancel Booking Secure Route

module.exports = router;
//Export User Router