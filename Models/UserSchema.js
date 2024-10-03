import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,  // Make email unique to prevent duplicates
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: true,
        enum: ['Admin', 'Instructor', 'Student']
    },
    active: {
        type: Boolean,
        default: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Profile schema
        ref: 'Profile'
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    image: {
        type: String,
        required: false  // If the image is auto-generated or optional, required can be false
    },
    tokens: [{
        token: {
          type: String,
          required: true
        }
      }],
    resetPasswordTokenExpires: {
        type: Date
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseProgress'
        }
    ]
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt timestamps
});

// Adding indexes for performance
UserSchema.index({ email: 1 });

export default mongoose.model('User', UserSchema);
