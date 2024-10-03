// import User from '../Models/UserSchema.js';
// import Profile from '../Models/ProfileSchema.js';
// import optGenerator from 'otp-generator';
// import OTP from '../Models/OTPSchema.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import cookie from 'cookie';
// import mailSender from '../utils/mailsender.js';
// import otpTemplate from '../mail/emailVerificationTemplate.js';
// import { passwordUpdated } from "../mail/passwordUpdate.js";

// dotenv.config();

// // ================ SEND-OTP For Email Verification ================
// export const sendOTP = async (req, res) => {
//     try {
//         // fetch email from req.body 
//         const { email } = req.body;

//         // check user already exist ?
//         const checkUserPresent = await User.findOne({ email });

//         // if exist then response
//         if (checkUserPresent) {
//             console.log('(when otp generate) User already registered');
//             return res.status(401).json({
//                 success: false,
//                 message: 'User is Already Registered'
//             });
//         }

//         // generate Otp
//         const otp = optGenerator.generate(6, {
//             upperCaseAlphabets: false,
//             lowerCaseAlphabets: false,
//             specialChars: false
//         });

//         const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
//         console.log(name);

//         // send otp in mail
//         await mailSender(email, 'OTP Verification Email', otpTemplate(otp, name));

//         // create an entry for otp in DB
//         await OTP.create({ email, otp });

//         // return response successfully
//         res.status(200).json({
//             success: true,
//             otp,
//             message: 'Otp sent successfully'
//         });
//     } catch (error) {
//         console.log('Error while generating Otp - ', error);
//         res.status(200).json({
//             success: false,
//             message: 'Error while generating Otp',
//             error: error.message
//         });
//     }
// }

// // ================ SIGNUP ================
// export const signup = async (req, res) => {
//     try {
//         // extract data 
//         const { firstName, lastName, email, password, confirmPassword,
//             accountType, contactNumber, otp } = req.body;

//         // validation
//         if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'All fields are required..!'
//             });
//         }

//         // check both passwords match or not
//         if (password !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Password & confirm password do not match, Please try again..!'
//             });
//         }

//         // check user has already registered
//         const checkUserAlreadyExists = await User.findOne({ email });

//         // if yes, then say to login
//         if (checkUserAlreadyExists) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User registered already, go to Login Page'
//             });
//         }

//         // find most recent otp stored for user in DB
//         const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

//         // if otp not found
//         if (!recentOtp || recentOtp.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Otp not found in DB, please try again'
//             });
//         } else if (otp !== recentOtp.otp) {
//             // otp invalid
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid Otp'
//             });
//         }

//         // hash - secure password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // additionalDetails
//         const profileDetails = await Profile.create({
//             gender: null, dateOfBirth: null, about: null, contactNumber: null
//         });

//         let approved = accountType === "Instructor" ? false : true;

//         // create entry in DB
//         await User.create({
//             firstName, lastName, email, password: hashedPassword, contactNumber,
//             accountType: accountType, additionalDetails: profileDetails._id,
//             approved: approved,
//             image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
//         });

//         // return success message
//         res.status(200).json({
//             success: true,
//             message: 'User Registered Successfully'
//         });
//     } catch (error) {
//         console.log('Error while registering user (signup)');
//         console.log(error);
//         res.status(401).json({
//             success: false,
//             error: error.message,
//             message: 'User cannot be registered, Please try again..!'
//         });
//     }
// }

// // ================ LOGIN ================
// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // validation
//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'All fields are required'
//             });
//         }

//         // check user is registered and saved data in DB
//         let user = await User.findOne({ email }).populate('additionalDetails');

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'You are not registered with us'
//             });
//         }

//         // compare given password and saved password from DB
//         if (await bcrypt.compare(password, user.password)) {
//             const payload = {
//                 email: user.email,
//                 id: user._id,
//                 accountType: user.accountType // This will help to check whether user has access to route, while authorization
//             };

//             // Generate token 
//             const token = jwt.sign(payload, process.env.JWT_SECRET, {
//                 expiresIn: "24h",
//             });

//             user = user.toObject();
//             user.token = token;
//             user.password = undefined; // we have removed password from object, not DB

//             // cookie
//             const cookieOptions = {
//                 expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
//                 httpOnly: true
//             }

//             res.cookie('token', token, cookieOptions).status(200).json({
//                 success: true,
//                 user,
//                 token,
//                 message: 'User logged in successfully'
//             });
//         } else {
//             // password not match
//             return res.status(401).json({
//                 success: false,
//                 message: 'Password not matched'
//             });
//         }
//     } catch (error) {
//         console.log('Error while Login user');
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             error: error.message,
//             message: 'Error while Login user'
//         });
//     // }
// }

// // ================ CHANGE PASSWORD ================
// export const changePassword = async (req, res) => {
//     try {
//         // extract data
//         const { oldPassword, newPassword, confirmNewPassword } = req.body;

//         // validation
//         if (!oldPassword || !newPassword || !confirmNewPassword) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'All fields are required'
//             });
//         }

//         // get user
//         const userDetails = await User.findById(req.user.id);

//         // validate old password entered correct or not
//         const isPasswordMatch = await bcrypt.compare(
//             oldPassword,
//             userDetails.password
//         );

//         // if old password does not match 
//         if (!isPasswordMatch) {
//             return res.status(401).json({
//                 success: false, 
//                 message: "Old password is Incorrect"
//             });
//         }

//         // check both passwords match
//         if (newPassword !== confirmNewPassword) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'The password and confirm password do not match'
//             });
//         }

//         // hash new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // update in DB
//         const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,
//             { password: hashedPassword },
//             { new: true });

//         // send email
//         try {
//             await mailSender(
//                 updatedUserDetails.email,
//                 'Password for your account has been updated',
//                 passwordUpdated(
//                     updatedUserDetails.email,
//                     `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
//                 )
//             );
//         } catch (error) {
//             console.error("Error occurred while sending email:", error);
//             return res.status(500).json({
//                 success: false,
//                 message: "Error occurred while sending email",
//                 error: error.message,
//             });
//         }

//         // return success response
//         res.status(200).json({
//             success: true,
//             message: 'Password changed successfully'
//         });
//     } catch (error) {
//         console.log('Error while changing password');
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             message: 'Error while changing password',
//             error: error.message
//         });
//     }
// }

// // ================ LOGOUT ================
// export const logout = async (req, res) => {
//     try {
//         res.cookie('token', null, {
//             expires: new Date(Date.now()),
//             httpOnly: true
//         });

//         return res.status(200).json({
//             success: true,
//             message: 'Logout Successfully'
//         });
//     } catch (error) {
//         console.log('Error while logging out');
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             message: 'Error while logging out'
//         });
//     }
// }
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// ================ REGISTER ================ 
export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, accountType } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new user
        const newUser = new User({ firstName, lastName, email, password, accountType });
        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================ LOGIN ================ 
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, accountType: user.accountType }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Store token in user document (optional)
        user.tokens.push({ token });
        await user.save();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountType: user.accountType
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================ GET USER ================ 
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -tokens'); // Exclude sensitive info
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================ UPDATE USER ================ 
export const updateUser = async (req, res) => {
    const { firstName, lastName, email, accountType } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName, email, accountType },
            { new: true, runValidators: true } // Returns the updated document
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================ LOGOUT ================ 
export const logoutUser = async (req, res) => {
    try {
        // Remove token from user document
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.body.token);
        await req.user.save();

        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
