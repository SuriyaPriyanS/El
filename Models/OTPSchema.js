import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Removed parentheses to pass the function
        expires: 3600,      // Document expires after 1 hour
    }
}, { timestamps: true });  // Adds createdAt and updatedAt fields automatically

export default mongoose.model('Otp', OtpSchema);
