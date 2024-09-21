import mongoose from 'mongoose';

const CourseProgresSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
       
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    compeletedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
        },


    ],

})

const CourseProgress = mongoose.model('CourseProgress', CourseProgresSchema);

export default CourseProgress;
