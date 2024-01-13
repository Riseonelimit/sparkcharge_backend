const{ 
    addStation,
    removeStation,
    getStationByLocation,
    addSlot,
    removeSlot,
    getStationSlotByLocation,
    getSlotByStation,
    getStationBySlug,
    promoteManager,
    demoteManager,
    getSlotTypeByStation
} = require('../controllers/station.controller.js')
//Import User Controller from user.controller.js

const { verifyJWT } = require('../middlewares/auth.middleware.js')
//Import JWT Verification Middleware from auth.middleware.js

const Router = require('express').Router
//Import Express Router
const router = Router()
//Create Router

router.route("/locate-station").get(getStationByLocation)
//Locate-Station Secure Route
router.route("/getslottype").get(getSlotTypeByStation)
//Locate Slot Type
router.route("/locate-slot").get(verifyJWT, getStationSlotByLocation)
//Locate-Slot Secure Route
router.route("/getslotbystation").get(verifyJWT, getSlotByStation)
//Locate Slot by Station Secure Route
router.route("/:slug").get(verifyJWT, getStationBySlug)
//Get Station by Slug Secure Route
router.route("/add-station").post(verifyJWT, addStation)
//Secure Add Station Route
router.route("/remove-station").post(verifyJWT, removeStation)
//Secure Remove Station Route
router.route("/add-slot").post(verifyJWT, addSlot)
//Secure Add Slot Route
router.route("/remove-slot").post(verifyJWT, removeSlot)
//Secure Remove Slot Route
router.route("/promote-manager").post(verifyJWT, promoteManager)
//Secure Promote Manager Route
router.route("/demote-manager").post(verifyJWT, demoteManager)
//Secure Demote Manager Route

module.exports = router
//Export User Router