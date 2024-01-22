const {
    razorpaygenorder,
    verifyrazorsignature
} = require('../controllers/transaction.controller.js')

const { verifyJWT } = require('../middlewares/auth.middleware.js')

const Router = require('express').Router
//Import Express Router

const router = Router()
//Create Router

router.route("/razorpay-order").post(verifyJWT, razorpaygenorder)
router.route("/verifysignature").post(verifyJWT, verifyrazorsignature)

module.exports = router