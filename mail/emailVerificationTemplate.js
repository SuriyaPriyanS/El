import eventNames from '../Models/SectionSchema.js';

const otpTemplate = (otp, name)=> {
    return `
    <h1>Hello ${name},</h1>
    <p>Your one-time password (OTP) for E-Learning Platform is ${otp}.</p>
    <p>Please use this OTP to complete your registration process.</p>
    <p>Thank you!</p>
    `;
}

export default otpTemplate;