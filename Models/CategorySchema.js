import mongoose from 'mongoose';


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    descripation: {
        type: String,
        required: true
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
    ],

});

const Category = mongoose.model('Category', categorySchema);

export default Category;