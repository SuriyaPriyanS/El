import mongoose from "mongoose";


import dotenv from 'dotenv';


dotenv.config();

const mongodb_URL = process.env.MONGODB_URL;

const connectDB = async (req,res) =>{
    try {
       const connection = await mongoose.connect(mongodb_URL);
       console.log("MongoDB Connected Successfully");
       return connection; 
    } catch (error) {

        console.log(error);
       
    }
}


export default connectDB;