const { registerUser } = require('../controllers/user.controller.js');

const Router = require('express').Router;

const router = Router();

router.route("/register").post(registerUser);

module.exports = router;