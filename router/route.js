import { Router } from "express";

const router = Router()

// import all controller
import * as controller from '../controllers/appController.js';
import { registerMail } from "../controllers/mail.js";
import Auth, { localVariables }  from "../middleware/auth.js";


// post method
router.route('/register').post(controller.register);
router.route('/registerMail').post(registerMail);      // send email
router.route('/autheticate').post((req, res) => res.end());       // autheticate user
router.route('/login').post(controller.verifyUser ,controller.login)               // login user


//get method
router.route('/user/:username').get(controller.getUser)   // user with username
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP)  // generate random OTP
router.route('/verifyOTP').get(controller.verifyOTP)     // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession)   // reset all variables


//put method
// if you are using params  update user info, it will be /updateUser/:id
// if you are using query to update user info, it will be /updateUser
router.route('/updateUser').put(Auth, controller.updateUser)        // use to update user profile
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword)       // use to reset password


export default router