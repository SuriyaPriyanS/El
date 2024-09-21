import mongoose from 'mongoose';

import Section from '../Models/SectionSchema.js';
import SubSection from '../Models/SubSectionSchema.js';
import CourseProgress from '../Models/CourseProgressSchema.js';


export const updateCourseProgress = async (req,res) => {

    const {courseId,subsectionId} = req.body
    const userId = req.user._id;
    try{
        const subsection = await SubSection.findById(subsectionId)
        if(!subsection) return res.status(404).json({message: 'Subsection not found'})
            
        const courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId: userId
        })
        
        if(!courseProgress){
            return res.status(404).json({
                message: 'Course progress not found'
            })
        }
        else {
            if (courseProgress.completedVideos.includes(subsectionId)) {
                return res.status(400).json({ error: "Subsection already completed" })
              }
        
              // Push the subsection into the completedVideos array
              courseProgress.completedVideos.push(subsectionId)
            }
        
            // Save the updated course progress
            await courseProgress.save()
        
            return res.status(200).json({ message: "Course progress updated" })
          }
          catch (error) {
            console.error(error)
            return res.status(500).json({ error: "Internal server error" })
          }
        }
        
        
        


    
