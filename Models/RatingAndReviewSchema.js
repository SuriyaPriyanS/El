import mongoose from 'mongoose';

const RatingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true,
    },
    course : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },


});

export default mongoose.model('RatingAndReview', RatingAndReviewSchema);
