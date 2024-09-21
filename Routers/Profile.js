import express from 'express';
import { auth, isInstructor } from '../Middlware/auth.js';
import { deleteAccount, getEnrolledCourses, getUserDetails, instuctorDashboard, updateProfile, UpdateUserProfileImge } from '../Controllers/Profile.js';


const router = express.Router();


// Delete User Account

router.delete('/deleteProfile', auth, deleteAccount);
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getUserDetails);

//Get Enrolled Coures
router.get('/getEnrolledCoures', auth, getEnrolledCourses);

router.put('/updateUserProfileImage', auth, UpdateUserProfileImge);

router.get('/instructorDashboard', auth, isInstructor, instuctorDashboard);

export default router;