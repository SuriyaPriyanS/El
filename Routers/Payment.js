import express from 'express';
import { auth, isStudent } from '../Middlware/auth.js';
import { caputrePayment, verifyPayment } from '../Controllers/Payments.js';

const router = express.Router();

//payment to method create, delete , 

router.post('/capturePayment',auth, isStudent, caputrePayment);
router.post('/verifyPayment', auth, isStudent, verifyPayment);


export default router;