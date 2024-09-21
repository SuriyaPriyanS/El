import express from 'express';
import { auth, isAdmin, isInstructor, isStudent } from '../Middlware/auth.js';
import { createSection, deleteSection } from '../Controllers/Section.js';
import { createSubSection, deleteSubSection, updateSubSection } from '../Controllers/SubSection.js';
import { updateCourseProgress } from '../Controllers/CouresProgress.js';
import { createCategory, getCategoryPageDetails, showAllCategories } from '../Controllers/Category.js';
import { createRating, getAllRatingReview, getAverageRating } from '../Controllers/RatingAndReview.js';
import { createCourse, deleteCourse, editCourse, getCourseDetails, getFullCourseDetails, getInstructorCourses } from '../Controllers/Course.js';

const router = express.Router();




router.post('/createCourse', auth, isInstructor, createCourse);
router.post('/addSection', auth, isInstructor, createSection );
router.post('/deleteSection', auth, isInstructor, deleteSection);
router.post('/addSubSection', auth, isInstructor, createSubSection);
router.post('/updateSubSection', auth, isInstructor, updateSubSection);
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);


router.post('/getCourseDetails', getCourseDetails);
router.get('/getAllCourseDetails', getCourseDetails);
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
router.get('/getInstructorCourses', auth, isInstructor, getInstructorCourses);

//edite Course route
router.post('/editCourse', auth, isInstructor, editCourse);
router.delete('/deleteCourse', auth, isInstructor, deleteCourse);
router.post('/updateCourseProgress', auth, isStudent, updateCourseProgress);

// Category can only be changed By admin


router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/showAllCategories', showAllCategories);
router.post('/getCategoryPageDetails', getCategoryPageDetails);


//Rating and Review

router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRatingReview);


export default router;