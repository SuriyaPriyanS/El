import User from '../Models/UserSchema.js';
import RatingAndReview from '../Models/RatingAndReviewSchema.js';
import mongoose from 'mongoose';



export const createRating = async (req,res)=> {
    try{
        const {rating, review, courseId} = req.body;

        const userId = req.user.id;

        if(!rating || !review || !courseId){
            returnres.status(401).json({
                success: false,
                message: 'All fileds are required'
            });
        }
        const courseDetails = await CourseProgress.findOne({_id: courseId},
            {
                studentsEnrolled: {_$elemMatch: {$eq: userId}}
            }
        );

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the course'
            });
        }
        const alreadyReviewed = await RatingAndReview.findOne(
           {course: courseId,user:userId}
        );
        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: 'Student has already reviewed this course'
            });
        }
        const ratingReview = await RatingAndReview.create({
            user:userId, course:courseId, rating,review});

            const updatedCourseDetails = await CourseProgress.findByIdAndUpdate({_id: courseId},
                {
                    $push: {
                        ratingAndReviews: ratingReview._id
                    }
                },
                {new: true}

                

            )

            return res.status(200).json({
                success: true,
                message: 'Rating and review created successfully',
                data: ratingReview
            })
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: 'Server Error'
            })
        }
    
    }

    export const getAverageRating = async (req,res)=> {
        try{
            const courseId = req.body.courseId;

            const result = await RatingAndReview.aggregate([
                {
                    $match: {
                        course: mongoose.Types.ObjectId(courseId)
                    },
                },
                {
                    $group: {
                        _id: null,
                        averageRating: {
                            $avg: "$rating"
                        },
                    }
                }
            
            ])
            if(result.length >0){
                return res.status(200).json({
                    success: true,
                    message: 'Average rating retrieved successfully',
                    data: result[0].averageRating,
                })

            }
            return res.status(200).json({
                success: true,
                message: 'Average Rating is 0, no ratings given till now',
                averageRating: 0,
            })


        }
        catch(error){
            console.log(error);
            returnres.status(500).json({
                success: false,
                message: 'Server Error'
            })
        }
    }

    export const getAllRatingReview = async (req,res)=> {
        try {
            const allReviews = await RatingAndReview.find({}).sort({rating: 'desc'}).populate({
                path: 'course',
                select: 'courseName'
            })
            .exec();
            return res. status(200).json({
                success: true,
                data:allReviews,
                message: 'All reviews fecthed successfully'
            });
        }
        catch (error){
            console.log('error while feching all ratings');
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Server Error'
            })
        }
    }
