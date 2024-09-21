import Section  from '../Models/SectionSchema.js';
import Course from '../Models/Course.js';



export const createSection  = async (req,res) => {
    try{
        const {sectionName, courseId} = req.body;
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        const newSection = await Section.create({sectionName});
        const updatedCourse = await Course.findByIdAndUpdate(courseId,{
            $push: {
                courseContent: newSection._id
            }

        }, 
        {new: true}
    );

    const updatedCourseDetails = await Course.findById(courseId).populate({
        path: 'courseContent',
        populate: {
            path: 'subSection'
        }
    })
    return res.status(201).json({
        success: true,
        message: 'Section created successfully',
        data: updatedCourseDetails
    })
}
    catch(error){
        console.log('Error while creating section');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error creating section'
        })
    }
}

export const updatedSection = async (req,res)=> {
    try{
        const {sectionName, sectionId, courseId} = req.body;

        if(!sectionId){
            return res.status(400).json({
                success: false,
                message: 'All fileds are required'
            });
        }

        await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});

        const updatedCourseDetails = await Course.findById(courseId).populate({
            path: 'courseContent',
            populate: {
                path:'subSection'
            }
        })
        res.status(200).json({
            success: true,
            message: 'Section updated successfully',
            data: updatedCourseDetails,
        });
    }
    catch(error){
        console.log('Error While updating section');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error updating section'
        })
    }

}

export const deleteSection = async (req,res)=> {
    try{
        const {sectionId, courseId} = req.body;
        await Section.findByIdAndDelete(sectionId);

        const updatedCourseDetails = await Course.findById(courseId).populate({
            path: 'courseContent',
            populate: {
                path:'subSection'
            }
        })
        res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
            data: updatedCourseDetails,
        });
        
    }
    catch(error){
        console.log('Error While deleting section');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while deleting section'
        })
    }
}

  