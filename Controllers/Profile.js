import CourseProgress from "../Models/CourseProgressSchema.js";
import ProfileSchema from "../Models/ProfileSchema.js";
import UserSchema from "../Models/UserSchema.js";







export const updateProfile = async (req,res) => {
    try {
       const { gender = '', dateofBirth = "", about = "", contactNumber = '', firstName, lastName } = req.body;
        const userID = req.user.id;

        const userDetails = await User.findById(userID);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await ProfileSchema.findById(profileId);

        userDetails.firstName = firstName;
        userDetails.lastName = lastName;
        await userDetails.save()
        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateofBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        const updatedUserDetails = await UserSchema.findById(userID).populate({
            path: 'additionalDetails'
        })
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUserDetails
        });
    } catch (error) {
        console.log('error while updating profile');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error updating profile'
        })
        
    }

}

export const deleteAccount = async (req,res)=> {
    try {
        const userId = req.user.id;
        const userDetails = await UserSchema.findById(userId);
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        await deleteResourceFromCloudinary(userDetails.image);

        const userEnrolledCoursesId = userDetails.courses
        console.log('userEnrolledCourses ids = ', userEnrolledCoursesId)

        for(const courseId of userEnrolledCoursesId){
            await Course.findByIdAndUpdate(courseId, {
                $pull: { studentsEnrolled: userId }
            })
        }
        await ProfileSchema.findByIdAndDelete(userDetails.additionalDetails);
        await UserSchema.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.log('error while deleting account');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error deleting account'
        })
        
    }
}

export const getUserDetails = async (req,res) => {
    try{
        const userId = req.user.id;
        const userDetails = await UserSchema.findById(userId).populate({
            path: 'additionalDetails'
        })
        res.status(200).json({
            success: true,
            message: 'User details fetched successfully',
            data: userDetails
        });
    }
    catch(error){
        console.log('error while fetching user details');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error fetching user details'
        })
    }
}

export const UpdateUserProfileImge = async (req,res)=> {
    try{
        const profileImage = req.files?.profileImage;
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(profileImage, process.env.FOLDER_NAME, 1000,1000);

        const updatedUserDetails = await UserSchema.findByIdAndUpdate(userId,{
            image: image.secure_url },
            {new: true}
        ).populate({
            path: 'additionalDetails'
        })
        res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            data: updatedUserDetails
        });
    

    }
    catch(error){
        console.log('Error while updating user profile image ');
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error updating user profile image'
        })

    }

}

export const getEnrolledCourses = async (req,res)=> {
    try {
        const userId = req.user.id;
        let userDetails = await UserSchema.findOne({_id: userId,}).populate({
            path: 'courses',
            populate: {
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            },
        })
        .exec()
        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for(var i = 0; i < userDetails.courses.length; i++){
            let totalDurationInSecond = 0
            SubsectionLength = 0
            for(var j = 0; j < userDetails.courses[i].courseContent.length; j++){
                totalDurationInSecond += userDetails.courses[i].courseContent[j].subSection.reduce((acc,curr)=>acc + parseInt(curr.timeDuration),0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSecond)
                SubsectionLength += userDetails.courses[i].coursContent[j].subSection.length

            }
            let courseProgressCount = await CourseProgress.findOne({
                courseId: userDetails.courses[i]._id,
                userId: userId,
            })

            courseProgressCount = courseProgressCount?.compeletedVideos.length
            if(SubsectionLength === 0){
                userDetails.courses[i].progressPercentage = 100

            }
            else {
                const mutiplier = Math.pow(10,2)
                userDetails.courses[i].progressPercentage = Math.round((courseProgressCount / SubsectionLength)* 100 * multiplier)/multiplier

            }
            if(!userDetails){
                return res.status(400).json({
                    success: false,
                    message: 'User not found'
                })
            }
            return res.status(200).json({
                success: true,
                message: 'User enrolled courses fetched successfully',
                data: userDetails.courses
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error fetching enrolled courses'
        })
        
    }

}

export const instuctorDashboard = async (req,res)=> {
    try {
        const courseDetails = await Course.find({instuctor: req.user.id})
        const courseData = courseDetails.map((course)=> {
            const totalStudentEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentEnrolled * course.price

            const courseDatawithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentEnrolled,
                totalAmountGenerated,
                
            }
            return courseDatawithStats
        })
        res.status(200).json(
            {
                courses: courseData,
                message:'Instructor Dashboard Data feched successfully'
            },
        )
    }
    catch (error){
        console.log(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}
