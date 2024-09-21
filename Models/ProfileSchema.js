import mongoose from 'mongoose';


const { Schema } = mongoose;

const profileSchema = new Schema({

    gender: {
        type: String
    },
    dateofBrith: {
        type: String
    },
    about: {
        type: String,
        trim: true
    },
    ContactNumber: {
        type: String,
        trim: true
    }
});

export default mongoose.model('Profile', profileSchema);
