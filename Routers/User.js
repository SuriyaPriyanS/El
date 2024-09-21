import express from 'express';
import { changePassword, login, sendOtp, signup } from '../Controllers/auth.js';
import { resetPassword, resetPasswordToken } from '../Controllers/ResetPassword.js';
import { auth } from '../Middlware/auth.js';

const router = express.Router();


//Routes for Login , signup and Authnactions

router.post('/signup', signup);
router.post('/login', login);

//router otp user email
router.post('/sentotp', sendOtp);
router.post('/changePassword', auth, changePassword);


router.post('/resetPassword-token', resetPasswordToken);
router.post('/resetpassword', resetPassword);


export default router;