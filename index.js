import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './Databases/config.js';
import dotenv from 'dotenv';
import { auth } from './Middlware/auth.js';
import  UserRouter from './Routers/User.js';
import paymentRouter from './Routers/Payment.js';
import  courseRouter from './Routers/course.js';
import profileRouter from './Routers/Profile.js';
import { cloudinaryConnect } from './Databases/Cloudinary.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'






const app = express();
connectDB();
cloudinaryConnect();

dotenv.config();

app.use(cors());
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.send('this is homepage')
})

app.use('/api/',auth, UserRouter );
app.use('/api/profile', profileRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/course', courseRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});