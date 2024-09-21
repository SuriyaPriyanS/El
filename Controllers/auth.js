import User from '../Models/UserSchema.js';
import Profile from '../Models/ProfileSchema.js';
import OTP from '../Models/OTPSchema.js'; // Assuming you have an OTP model
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generate as generateOTP } from 'otp-generator';
import mailSender from '../utils/mailsender.js'; // Assuming you have a mailSender utility
import otpTemplate from '../mail/emailVerificationTemplate.js';
import passwordUpdated from '../mail/passwordUpdate.js'; // Assuming an OTP template utility

// Send OTP function
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      console.log('User already registered');
      return res.status(401).json({
        message: 'User already registered',
      });
    }

    // Generate OTP
    const otp = generateOTP(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Format name from email
    const name = email
      .split('@')[0]
      .split('.')
      .map(part => part.replace(/[^A-Za-z0-9]/g, ''))
      .join(' ');

    console.log(name);

    // Send OTP via email
    await mailSender(email, 'OTP Verification Email', otpTemplate(otp, name));

    // Save OTP in database
    await OTP.create({ email, otp });
    console.log('OTP sent to user');

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// User signup function
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      console.log('User already registered');
      return res.status(401).json({ message: 'User already registered' });
    }

    // Validate OTP
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
    if (!recentOtp || recentOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      accountType,
      approved: false, // Assuming this needs to be initialized
      additionalDetails: null, // Assuming profile details will be created later
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    res.status(200).json({
      success: true,
      message: 'User Registered Successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// User login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Find user by email
    const user = await User.findOne({ email }).populate('additionalDetails');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = { email: user.email, id: user._id, accountType: user.accountType };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Remove password from user object
    const userObj = { ...user.toObject(), token };
    delete userObj.password;

    // Set cookie
    res.cookie('token', token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });

    res.status(200).json({
      success: true,
      user: userObj,
      message: 'User logged in successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Change password function
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Find user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { password: hashedPassword }, { new: true });

    // Send password update email
    try {
      await mailSender(
        updatedUser.email,
        'Password Update',
        `Password updated successfully for ${updatedUser.firstName} ${updatedUser.lastName}`
      );
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send password update email' });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
