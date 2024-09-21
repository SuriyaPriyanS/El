import User from '../Models/UserSchema.js';

import mailSender from '../utils/mailsender.js';
import bcrypt from 'bcryptjs';


export const resetPasswordToken = async (req,res)=>{
    try {
        const {email}= req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "Your Email is not registered with us"});
        }

        //Generate TOKEN 
        const token = crypto.randomBytes(20).toString("hex");

        const updatedUser = await User.findOneAndUpdate(
            {email: email},
            {token: token, resetPasswordTokenExpires: Date.now()+ 5 * 60 * 1000},
            {new: true}
        );


        const url = ``;

        //send email
        await mailSender(email, 'password Reset Link', `password Reset Link : ${url}`);

        res.status(200).json({success: true,
            message: 'Email sent successfully , please check your mail box and change password'
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message: "Something went wrong, please try again later"})
    }
}

export const resetPassword = async (req,res)=> {
    try {
        //extract token by anyone from this 3 ways

        const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer','');

        const {password, confirmPassword} = req.body;

        //validation
        if(!token || !password || !confirmPassword) {
            return res.status(401).json({
                success: false,
                message: 'Passwords are not matched'
            }

            );
        }

        const userDetails = await User.findOne({ token: token});


        if(token !==userDetails.token){
            return res.status(401).json({
                success: false,
                message: 'Passwords Reset token is not matched'
            });
        }

        if(!(userDetails.resetPasswordTokenExpires > Date.now())){
            returnres.status(401).json({
                success: false,
                message: 'Token is expired, please regenerate token'
            });
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate({token}, {password: hashedpassword},{new: true});
        res.status(200).json({success: true,
            message: 'password reset successfully'
        });


}

catch (error){
    console.log('error while reseting password');
    console.log(error);
    res.status(500).json({message: "Error while reseting password"})
}
}



