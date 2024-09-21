import Category from "../Models/CategorySchema.js";

// Utility function to generate random integer
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Create a new category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const categoryDetails = await Category.create({
            name: name,
            description: description
        });

        return res.status(200).json({
            success: true,
            message: 'Category created successfully',
            data: categoryDetails
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error creating Category'
        });
    }
};

// Show all categories with name and description
export const showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });

        return res.status(200).json({
            success: true,
            data: allCategories
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error fetching categories'
        });
    }
};

// Fetch category page details
export const getCategoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body;

        // Find the selected category with populated courses and ratings
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: 'courses',
                match: { status: "published" },
                populate: "ratingAndReviews",
            })
            .exec();

        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category Not Found'
            });
        }

        if (selectedCategory.courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No published courses in this category'
            });
        }

        // Find other categories except the selected one
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId }
        });

        // Ensure there are other categories available
        let differentCategory = null;
        if (categoriesExceptSelected.length > 0) {
            const randomCategory = categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)];
            differentCategory = await Category.findOne({ _id: randomCategory._id })
                .populate({
                    path: "courses",
                    match: { status: "published" },
                })
                .exec();
        }

        // Fetch all categories with published courses
        const allCategories = await Category.find().populate({
            path: 'courses',
            match: { status: "published" },
            populate: "ratingAndReviews",
        }).exec();

        // Get the top 10 most selling courses
        const allCourses = allCategories.flatMap(category => category.courses);
        const mostSellingCourses = allCourses.sort((a, b) => b.sold - a.sold).slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error fetching category details'
        });
    }
};
