const{ 
    addStation,
    removeStation,
    getStationByLocation
} = require('../controllers/station.controller.js');
//Import User Controller from user.controller.js

const { verifyJWT } = require('../middlewares/auth.middleware.js');
//Import JWT Verification Middleware from auth.middleware.js

const Router = require('express').Router;
//Import Express Router
const router = Router();
//Create Router

router.route("/add-station").post(verifyJWT, addStation)
//Secure Add Station Route
router.route("/remove-station").post(verifyJWT, removeStation)
//Secure Remove Station Route
router.route("/locate-station").get(verifyJWT, getStationByLocation)
//Locate-Station Secure Route

module.exports = router;
//Export User Router