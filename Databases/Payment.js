import Suriyapay from 'razorpay';

import dotenv from 'dotenv';
config();

const razorpay = new Suriyapay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

