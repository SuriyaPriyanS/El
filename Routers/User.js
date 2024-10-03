import express from 'express';
const router = express.Router();

// Controllers
import {
    signup,
    login,
    sendOTP,
    changePassword
} from '../Controllers/auth.js';

// Reset password controllers
import {
    resetPasswordToken,
    resetPassword,
} from '../controllers/resetPassword.js';

// Middleware
import { auth } from '../Middlware/auth.js';

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// Route for sending OTP to the user's email
router.post('/sendotp', sendOTP);

// Route for changing the password
router.post('/changepassword', auth, changePassword);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post('/reset-password-token', resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

// Export the router
export default router;
