import Course from "../Models/Course.js";
import UserSchema from "../Models/UserSchema.js";
import Category from "../Models/CategorySchema.js";
import Section from '../Models/SectionSchema.js';
import SubSectionSchema from "../Models/SubSectionSchema.js";
import CourseProgress from "../Models/CourseProgressSchema.js";
import { uploadImageToCloudinary } from "../utils/imageFileUploders.js";




export const createCourse = async (req,res)=> {
    try{
        let {courseName, courseDescription,whatYouWillLearn, price, Category, instructions: _instructions,status, tag: _tag  }= req.body;

        const tag = JSON.parse(_tag);
        const instructions = JSON.parse(_instructions);

        const thumbnail = req.files?.thumbnailImage;

        if(!courseName|| !courseDescription || !whatYouWillLearn || !price || !Category|| !thumbnail || !instructions.length ||  !tag.length){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });


        }

        if(!status || status === undefined) {
            status = 'draft';
        }

        const instructorId = req.user.id;

        const categoryDetails = await Category.findById(Category);
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        const thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

         const newCourse = await Course.create({
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            instructor: instructorId,
            thumbnail: thumbnailDetails.secure_url,
            instructions,
            category: categoryDetails._id,
            status,
            tags: tag,
            createdAt: Date.now(),
         });

         await UserSchema.findByIdAndUpdate(instructorId,{
            $push: {
                courses: newCourse._id
            }
        },
        {new: true}

         );

         await Category.findByIdAndUpdate(
            {_id: Category},
            {
                $push: {
                    courses: newCourse._id,
                },

            },
            {new: true}
         );

         res.status(200).json({
            success: true,
            message: 'Course created successfully',
            course: newCourse
         });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error creating course'
        });
    
}
}

export const getAllCourses = async (req,res)=> {
    try{
        const allCoures = await Course.find({},
            {
                courseName: true,
                courseDescription: true,
                price: true,
                instructor: true,
                thumbnail: true,
                ratingAndReviews: true,
                studentsEnrolled: true
            }
        ).populate({
            path: 'instructor',
            select: 'firstName lastName'

        })
        .exec();
        res.status(200).json({
            success: true,
            data: allCoures,
            message: 'All courses fetched successfully'
        });
    }
    catch(error){
        console.log('error while feching all courses');
        return res.status(500).json({
            success: false,
            message: 'Error While feching data of all courses'
        });
    
}
}

export const getCourseDetails = async (req,res)=> {
    try{
        const {courseId} = req.body;
        //find course details

        const courseDetails = await Course.findOne({
            _id: courseId, 
        })
        .populate({
            path: 'instructor',
            populate: {
                path: 'additionalDetails'
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
                select: "videoUrl",
            },

        })
        .exec();

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((section) => {
            section.subSection.forEach((subSection) => {
                const totalDurationInSeconds =  parseInt(subSection.timeDuration) 
                totalDurationInSeconds += totalDurationInSeconds
            });
        });
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        res.status(200).json({
            success: true,
            data: courseDetails,
            totalDuration
        });


    }
    catch(error){
        console.log('error while fetching course details');
        return res.status(500).json({
            success: false,
            message: 'Error while feching course details'
        }); 
    }
}

export const getFullCourseDetails = async(req,res)=> {
    try{
        const {coureId} = req.body;
        const userId =req.user.id
        const courseDetails = await Course.findOne({
            _id: coureId,
        })
        .populate({
            path: 'instructor',
            populate: {
                path: 'additionalDetails'
            },
        })
        .populate('category')
        .populate('ratingAndReviews')
        .populate({
            path: 'courseContent',
            populate: {
                path:'subSection',
                select: 'videoUrl',
            },
        })
        .exec();

        let courseProgressCount = await CourseProgress.findOne({
            courseId: courseDetails._id,
            
            userId: userId,
        })

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        let totalDurationSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
               const timeDurationInseconds = parseInt(subSection.timeDuration)
               totalDurationInSeconds += timeDurationInseconds
            });
        });
        const totalDuration = convertSecondsToDuration(totalDurationSeconds)
        return res.status(200).json({
            success: true,
            data: courseDetails,
            totalDuration,
            completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [],
        
            
        })
    }
    catch(error){
        console.log('error while fetching course details');
        return res.status(500).json({
            success: false,
            message: 'Error while feching course details'
        });
    
}
}

export const editCourse = async(req, res)=> {
    try{
        const {courseId}= req.body;
        const updates = req.body
        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        if(req.files){
            const thumbnail = req.files?.thumbnailImage;
            const thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
            updates.thumbnail = thumbnailDetails.secure_url;
        }
        for(const key in updates){
            if(updates.hasOwnProperty(key)){
                if(key === "tag" || key === "instuctions"){
                    updates[key] = JSON.parse(updates[key])
                }
                else {
                    course[key] = updates[key]
                }
            }
        }
        course.updatedAt = Date.now();

        await course.save();

        const updatedCourse = await Course.findOne({
            _id: courseId
        })
        .populate({
            path: 'instructor',
            populate: {
                path: 'additionalDetails'
            },
        })
        .populate('category')
        .populate('ratingAndReviews')
        .populate({
            path: "courseContent",
            populate: {
                path:'subSection',
                select: 'videoUrl',
            },
        })
        .exec()

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse,
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error while updating course",
            error: error.message,
    })
}
}

export const getInstructorCourses = async (req,res)=> {
    try{
        const instructorId = req.user.id

        const instructorCourses = await Course.find({
            instructor: instructorId,
        })
        .sort({
           createdAt: -1 
        })
        res.status(200).json({
            success: true,
            data: instructorCourses,
            message: 'Courses made by Instuctor feched successfully'
        })
    }
    catch (error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: "failled to retrieve instructor courses",
            error: error.message,
    })
}


}

export const deleteCourse = async (req, res) => { 
    try { 
        const { courseId } = req.body;

        // Find the course 
        const course = await Course.findById(courseId); 
        if (!course) { 
            return res.status(404).json({ message: "Course not found" }); 
        }

        // Unenroll students from the course 
        const studentsEnrolled = course.studentsEnrolled; 
        for (const studentId of studentsEnrolled) { 
            await User.findByIdAndUpdate(studentId, { 
                $pull: { courses: courseId }, 
            }); 
        }

        // Delete course thumbnail from Cloudinary 
        await deleteResourceFromCloudinary(course?.thumbnail);

        // Delete sections and sub-sections 
        const courseSections = course.courseContent; 
        for (const sectionId of courseSections) { 
            const section = await Section.findById(sectionId);
            if (section) { 
                const subSections = section.subSection; 
                for (const subSectionId of subSections) { 
                    const subSection = await SubSectionSchema.findById(subSectionId);
                    if (subSection) { 
                        await deleteResourceFromCloudinary(subSection.videoUrl); // delete course videos from Cloudinary
                    } 
                    await SubSectionSchema.findByIdAndDelete(subSectionId); 
                }
            } 
            await Section.findByIdAndDelete(sectionId); 
        }

        // Delete the course 
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({ 
            success: true, 
            message: "Course deleted successfully", 
        }); 
    } catch (error) { 
        console.error(error); 
        return res.status(500).json({ 
            success: false, 
            message: "Error while deleting course", 
            error: error.message, 
        }); 
    } 
};
