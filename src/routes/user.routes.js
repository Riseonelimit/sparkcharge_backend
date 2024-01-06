const{
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
    getUserSlug,
    walletTopUp
    } = require('../controllers/user.controller.js')
//Import User Controller from user.controller.js

const { verifyJWT } = require('../middlewares/auth.middleware.js')
//Import JWT Verification Middleware from auth.middleware.js

const Router = require('express').Router
//Import Express Router
const router = Router()
//Create Router

router.route("/register").post(registerUser)
//Register User Route

router.route("/login").post(loginUser)
//Login User Route

router.route("/get-user").get(verifyJWT, getCurrentUser)
//Secure Get Current User Route
router.route("/get-vehicle").get(verifyJWT, getUserVehicle)
//Secure Get Vehicle Route
router.route("/:slug").get(verifyJWT, getUserSlug)
//Secure Get Vehicle Route
router.route("/logout").post(verifyJWT, logoutUser)
//Secure Logout User Route
router.route("/refresh-token").post(verifyJWT, refreshAccessToken)
//Secure Refresh Access Token Route
router.route("/terminate").post(verifyJWT, deleteAccount)
//Secure Delete Account Route
router.route("/change-password").post(verifyJWT, changePassword)
//Secure Change Password Route
router.route("/add-vehicle").post(verifyJWT, addVehicle)
//Secure Add Vehicle Route
router.route("/delete-vehicle").post(verifyJWT, deleteVehicle)
//Secure Delete Vehicle Route
router.route("/promote-admin").post(verifyJWT, promoteAdmin)
//Secure Promote Admin Route
router.route("/demote-admin").post(verifyJWT, demoteAdmin)
//Secure Demote Admin Route
router.route("/wallet-top-up").post(verifyJWT, walletTopUp)

module.exports = router
//Export User Router